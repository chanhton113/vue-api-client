<template>
  <div class="task-management">
    <HeaderComponent />

    <div class="task">
      <div class="nav-task">
        <div class="nav-task-left">
          <div class="add-task">
            <button @click="showModal = true">Thêm Task Mới</button>
          </div>

          <div v-if="showModal" class="modal">
            <div class="modal-content">
              <form @submit.prevent="newTask.task_id ? updateTask() : createTask()">
                <div>
                  <label for="title">Tên Task:</label>
                  <input type="text" id="title" v-model="newTask.title" required />
                </div>

                <div>
                  <label for="start_date">Ngày Bắt Đầu:</label>
                  <input type="date" id="start_date" v-model="newTask.start_date" required />
                </div>
                <div>
                  <label for="end_date">Ngày Kết Thúc:</label>
                  <input type="date" id="end_date" v-model="newTask.end_date" />
                </div>
                <div>
                  <label for="status">Trạng Thái:</label>
                  <select id="status" v-model="newTask.status" required>
                    <option value="">Chọn trạng thái</option>
                    <option value="in-progress">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="pending">Đang chờ</option>
                  </select>
                </div>
                <div>
                  <label for="user_id">Người Dùng:</label>
                  <select id="user_id" v-model="newTask.user_id" required>
                    <option value="">Chọn người dùng</option>
                    <option v-for="user in userList" :key="user.user_id" :value="user.user_id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="contact_id">Liên Hệ:</label>
                  <select id="contact_id" v-model="newTask.contact_id" required>
                    <option value="">Chọn liên hệ</option>
                    <option v-for="contact in contactList" :key="contact.contact_id" :value="contact.contact_id">
                      {{ contact.name }}
                    </option>
                  </select>
                </div>

                <div class="modal-actions">
                  <button type="submit">Lưu</button>
                  <button type="button" @click="closeModal">Đóng</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="task-list">
        <h3>Danh Sách Task</h3>
        <button @click="exportTasks">Export CSV</button>

        <table>
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>Tên Task</th>
              <th>Ngày Bắt Đầu</th>
              <th>Ngày Kết Thúc</th>
              <th>Trạng Thái</th>
              <th>Người Dùng</th>
              <th>Liên Hệ</th>
              <th>Thao Tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="task in tasks" :key="task.task_id">
              <td><input type="checkbox" v-model="selectedTasks" :value="task.task_id" /></td>
              <td>{{ task.title }}</td>
              <td>{{ task.start_date }}</td>
              <td>{{ task.end_date || 'Chưa có' }}</td>
              <td>{{ statusLabel(task.status) }}</td>
              <td>{{ getUserName(task.user_id) || 'Chưa có' }}</td>
              <td>{{ getContactName(task.contact_id) || 'Chưa có' }}</td>
              <td>
                <button @click="editTask(task)"><Edit /></button>
                <button @click="confirmDelete(task.task_id)"><Delete /></button>
              </td>
            </tr>
          </tbody>
        </table>

        <button v-if="selectedTasks.length" @click="confirmDeleteMultiple">Xóa các task đã chọn</button>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import HeaderComponent from '../../components/header/Header.vue';
import FooterComponent from '../../components/footer/Footer.vue';
import Edit from '../../components/icons/edit.vue';
import Delete from '../../components/icons/delete.vue';
import '../../assets/css/TasksView.css';

const tasks = ref([]);
const newTask = ref({
  title: '',
  start_date: '',
  end_date: '',
  status: '',
  user_id: '',
  contact_id: '',
  task_id: ''
});
const selectedTasks = ref([]);
const selectAll = ref(false);
const showModal = ref(false);
const users = ref({});
const contacts = ref({});
const userList = ref([]);
const contactList = ref([]);

const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    userList.value = response.data;
    users.value = response.data.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchContacts = async () => {
  try {
    const response = await api.get('/contacts');
    contactList.value = response.data;
    contacts.value = response.data.reduce((acc, contact) => {
      acc[contact.id] = contact.name;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching contacts:', error);
  }
};

const fetchTasks = async () => {
  try {
    const response = await api.get('/tasks');
    tasks.value = response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

const createTask = async () => {
  try {
    const response = await api.post('/tasks/create', newTask.value);
    tasks.value.push(response.data);
    closeModal();
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

const updateTask = async () => {
  try {
    const response = await api.put(`/tasks/update/${newTask.value.task_id}`, newTask.value);
    const index = tasks.value.findIndex(task => task.task_id === response.data.task_id);
    tasks.value[index] = response.data;
    closeModal();
  } catch (error) {
    console.error('Error updating task:', error);
  }
};


const editTask = (task) => {
  newTask.value = { ...task };
  showModal.value = true;
};

const closeModal = () => {
  newTask.value = { title: '', start_date: '', status: '', user_id: '', contact_id: '', task_id: null };
  showModal.value = false;
};

const confirmDelete = (task_id) => {
  if (confirm('Bạn có chắc chắn muốn xóa task này không?')) {
    deleteTask(task_id);
  }
};

const deleteTask = async (task_id) => {
  try {
    await api.delete(`/tasks/${task_id}`);
    tasks.value = tasks.value.filter(task => task.task_id !== task_id);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

const confirmDeleteMultiple = () => {
  if (confirm('Bạn có chắc chắn muốn xóa các task đã chọn không?')) {
    deleteMultipleTasks();
  }
};

const deleteMultipleTasks = async () => {
  try {
    await api.post('/tasks/destroy_multiple', { task_ids: selectedTasks.value });
    tasks.value = tasks.value.filter(task => !selectedTasks.value.includes(task.task_id));
    selectedTasks.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error('Error deleting multiple tasks:', error);
  }
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedTasks.value = tasks.value.map(task => task.task_id);
  } else {
    selectedTasks.value = [];
  }
};
const statusLabel = (status) => {
  switch (status) {
    case 'in-progress':
      return 'Đang xử lý';
    case 'completed':
      return 'Hoàn thành';
    case 'pending':
      return 'Đang chờ';
    default:
      return 'Không rõ';
  }
};
const getUserName = (user_id) => {
  const user = userList.value.find(u => u.user_id === user_id);
  return user ? user.name : 'Chưa có';
};

const getContactName = (contact_id) => {
  const contact = contactList.value.find(c => c.contact_id === contact_id);
  return contact ? contact.name : 'Chưa có'; 
};

const exportTasks = () => {
  let csv = 'Tên Task,Ngày Bắt Đầu,Trạng Thái,Người Dùng,Liên Hệ\n';
  tasks.value.forEach(task => {
    const userName = users.value[task.user_id] || 'Chưa có';
    const contactName = contacts.value[task.contact_id] || 'Chưa có';
    csv += `"${task.title}","${task.start_date}","${task.status}","${userName}","${contactName}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'tasks.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  fetchUsers();
  fetchContacts();
  fetchTasks();
});
</script>
