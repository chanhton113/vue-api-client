<template>
  <div class="contact-management">
    <HeaderComponent />

    <div class="contact">
      <div class="nav-contact">
        <div class="nav-contact-left">
          <div class="add-contact">
            <button @click="showModal = true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.1634 2.25H5.83735C3.63284 2.25 2.25 3.81089 2.25 6.01978V11.9802C2.25 14.1891 3.62627 15.75 5.83735 15.75H12.1627C14.3744 15.75 15.75 14.1891 15.75 11.9802V6.01978C15.75 3.81089 14.3744 2.25 12.1634 2.25Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 6.52075V11.4654" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11.4742 8.99426H6.52441" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Thêm Liên Hệ Mới</button>
          </div>
          <div v-if="showModal" class="modal">
            <div class="modal-content">
              <form @submit.prevent="newContact.contact_id ? updateContact() : createContact()">
                <div>
                  <label for="name">Tên:</label>
                  <input type="text" id="name" v-model="newContact.name" required />
                </div>
                <div>
                  <label for="email">Email:</label>
                  <input type="email" id="email" v-model="newContact.email" required />
                </div>
                <div>
                  <label for="phone">Điện thoại:</label>
                  <input type="text" id="phone" v-model="newContact.phone" />
                </div>
                <div>
                  <label for="address">Địa chỉ:</label>
                  <input type="text" id="address" v-model="newContact.address" />
                </div>
                <div>
                  <label for="opportunity">opportunity:</label>
                  <input type="text" id="opportunity" v-model="newContact.opportunity" />
                </div>
                <button type="submit">Lưu</button>
                <button type="button" @click="closeModal">Đóng</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Bộ lọc tìm kiếm -->
        <form class="contact-filters" @submit.prevent="fetchContacts">
          <div>
            <input type="email" v-model="filters.email" placeholder="Nhập email..." />
          </div>
          <div>
            <input type="date" v-model="filters.created_at" />
          </div>
          <div>
            <input type="text" v-model="filters.creator" placeholder="Nhập tên ..." />
          </div>
          <div>
            <input type="text" v-model="filters.search_text" placeholder="Tìm kiếm..." />
          </div>
        </form>
      </div>

      <div class="contact-list">
        <h3>Danh Sách Liên Hệ</h3>
        <button @click="exportContacts">Export</button>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>Tên</th>
              <th>Email</th>
              <th>Điện Thoại</th>
              <th>Địa Chỉ</th>
              <th>opportunity</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in contacts" :key="contact.contact_id">
              <td><input type="checkbox" v-model="selectedContacts" :value="contact.contact_id" /></td>
              <td>{{ contact.name }}</td>
              <td>{{ contact.email }}</td>
              <td>{{ contact.phone }}</td>
              <td>{{ contact.address }}</td>
              <td>{{ contact.opportunity }}</td>
              <td>
                <button @click="editContact(contact)">
                  <Edit/>
                </button>
                <button @click="deleteContact(contact.contact_id)">
                  <Delete/>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <button v-if="selectedContacts.length" @click="deleteMultipleContacts">Xóa các contact đã chọn</button>
      </div>
    </div>

    <FooterComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../../api/axios';
import HeaderComponent from '../../components/header/Header.vue';
import FooterComponent from '../../components/footer/Footer.vue';
import Edit from '../../components/icons/edit.vue';
import Delete from '../../components/icons/delete.vue';
import '../../assets/css/ContactView.css';

const contacts = ref([]);
const newContact = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  opportunity: '',
  contact_id: null
});
const selectedContacts = ref([]);
const selectAll = ref(false);
const showModal = ref(false);
const filters = ref({
  email: '',
  created_at: '',
  creator: '',
  account_type: '',
  search_text: ''
});
const exportContacts = () => {
  const contactsData = contacts.value;
  const csv = contactsData.map(contact => {
    return `${contact.name},${contact.email},${contact.phone},${contact.address},${contact.opportunity}`;
  }).join("\n");

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'contacts.csv';
  link.click();
};


const fetchContacts = async () => {
  const response = await api.get('/contacts', { params: filters.value });
  contacts.value = response.data;
};

const createContact = async () => {
  const response = await api.post('/contacts', newContact.value);
  contacts.value.push(response.data);
  closeModal();
};

const updateContact = async () => {
  const response = await api.put(`/contacts/${newContact.value.contact_id}`, newContact.value);
  const index = contacts.value.findIndex(contact => contact.contact_id === response.data.contact_id);
  contacts.value[index] = response.data;
  closeModal();
};


const editContact = contact => {
  newContact.value = { ...contact };
  showModal.value = true;
};


const closeModal = () => {
  newContact.value = { name: '', email: '', phone: '', address: '', opportunity: '', contact_id: null };
  showModal.value = false;
};

const deleteContact = async (contact_id) => {
  await api.delete(`/contacts/${contact_id}`);
  contacts.value = contacts.value.filter(contact => contact.contact_id !== contact_id);
};

const deleteMultipleContacts = async () => {
  await api.post('/contacts/destroy_multiple', { ids: selectedContacts.value });
  contacts.value = contacts.value.filter(contact => !selectedContacts.value.includes(contact.contact_id));
  selectedContacts.value = [];
  selectAll.value = false;
};


const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedContacts.value = contacts.value.map(contact => contact.contact_id);
  } else {
    selectedContacts.value = [];
  }
};

watch(filters, fetchContacts, { deep: true });

onMounted(() => {
  fetchContacts();
});
</script>
