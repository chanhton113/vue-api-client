<template>
  <div class="opportunity-management">
    <HeaderComponent />

    <div class="opportunity">
      <div class="nav-opportunity">
        <div class="nav-opportunity-left">
          <div class="add-opportunity">
            <button @click="showModal = true">
              Thêm Cơ Hội Mới
            </button>
          </div>

          <!-- Modal thêm/cập nhật cơ hội -->
          <div v-if="showModal" class="modal">
            <div class="modal-content">
              <form @submit.prevent="handleSubmit">
                <div>
                  <label for="name">Tên Cơ Hội:</label>
                  <input type="text" id="name" v-model="newOpportunity.name" required />
                </div>
                <div>
                  <label for="value">Giá trị:</label>
                  <input type="number" id="value" v-model="newOpportunity.value" required />
                </div>
                <div>
                  <label for="contact_id">Liên hệ:</label>
                  <select id="contact_id" v-model="newOpportunity.contact_id" required>
                    <option v-for="contact in contacts" :key="contact.contact_id" :value="contact.contact_id">
                      {{ contact.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label for="phase">Giai đoạn:</label>
                  <input type="text" id="phase" v-model="newOpportunity.phase" />
                </div>
                <div>
                  <label for="organisation">Tổ chức:</label>
                  <input type="text" id="organisation" v-model="newOpportunity.organisation" />
                </div>
                <div>
                  <label for="closing_date">Ngày kết thúc:</label>
                  <input type="date" id="closing_date" v-model="newOpportunity.closing_date" />
                </div>
                <button type="submit">{{ newOpportunity.opportunitie_id ? 'Cập nhật' : 'Tạo mới' }}</button>
                <button type="button" @click="closeModal">Đóng</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Form lọc -->
        <form class="opportunity-filters" @submit.prevent="fetchOpportunities">
          <input type="text" v-model="filters.name" placeholder="Tên cơ hội..." @input="onFilterChange" />
          <input type="text" v-model="filters.stage" placeholder="Giai đoạn..." @input="onFilterChange" />
          <input type="text" v-model="filters.contact" placeholder="Liên hệ..." @input="onFilterChange" />
        </form>
      </div>

      <!-- Danh sách cơ hội -->
      <div class="opportunity-list">
        <h3>Danh Sách Cơ Hội</h3>
        <button @click="exportOpportunities">Export</button>
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>Tên</th>
              <th>Giá trị</th>
              <th>Giai đoạn</th>
              <th>Liên hệ</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="opportunity in opportunities" :key="opportunity.opportunitie_id">
              <td><input type="checkbox" v-model="selectedOpportunities" :value="opportunity.opportunitie_id" /></td>
              <td>{{ opportunity.name }}</td>
              <td>{{ opportunity.value }}</td>
              <td>{{ opportunity.phase }}</td>
              <td>{{ getContactName(opportunity.contact_id) }}</td>
              <td>
                <button @click="editOpportunity(opportunity)"><Edit /></button>
                <button @click="deleteOpportunity(opportunity.opportunitie_id)"><Delete /></button>
              </td>
            </tr>
          </tbody>
        </table>

        <button v-if="selectedOpportunities.length" @click="deleteMultipleOpportunities">
          Xóa các cơ hội đã chọn
        </button>
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
import '../../assets/css/OpportunitiesView.css';

const opportunities = ref([]);
const contacts = ref([]);
const newOpportunity = ref(resetOpportunity());
const filters = ref({ name: '', phase: '', contact: '' });
const selectedOpportunities = ref([]);
const selectAll = ref(false);
const showModal = ref(false);

function resetOpportunity() {
  return {
    opportunitie_id: '',
    name: '',
    value: '',
    contact_id: '',
    phase: '',
    organisation: '',
    closing_date: ''
  };
}

const fetchOpportunities = async () => {
  try {
    const response = await api.get('/opportunities', { params: filters.value });
    opportunities.value = response.data;
  } catch (error) {
    console.error('Lỗi fetch opportunities:', error);
  }
};

const fetchContacts = async () => {
  try {
    const response = await api.get('/contacts');
    contacts.value = response.data;
  } catch (error) {
    console.error('Lỗi fetch contacts:', error);
  }
};

const handleSubmit = async () => {
  if (newOpportunity.value.opportunitie_id) {
    await updateOpportunity();
  } else {
    await createOpportunity();
  }
};

const createOpportunity = async () => {
  try {
    const response = await api.post('/opportunities', newOpportunity.value);
    opportunities.value.push(response.data);
    closeModal();
  } catch (error) {
    console.error('Lỗi tạo cơ hội:', error);
  }
};

const updateOpportunity = async () => {
  try {
    const url = `/opportunities/${newOpportunity.value.opportunitie_id}`;
    const response = await api.put(url, newOpportunity.value);
    const index = opportunities.value.findIndex(o => o.opportunitie_id === response.data.opportunitie_id);
    if (index !== -1) opportunities.value[index] = response.data;
    closeModal();
  } catch (error) {
    console.error('Lỗi cập nhật cơ hội:', error);
  }
};

const deleteOpportunity = async (opportunitie_id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa cơ hội này không?')) return;
  try {
    await api.delete(`/opportunities/delete/${opportunitie_id}`);
    opportunities.value = opportunities.value.filter(o => o.opportunitie_id !== opportunitie_id);
  } catch (error) {
    console.error('Lỗi xóa cơ hội:', error);
  }
};

const editOpportunity = (opportunity) => {
  newOpportunity.value = { ...opportunity };
  showModal.value = true;
};

const closeModal = () => {
  newOpportunity.value = resetOpportunity();
  showModal.value = false;
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedOpportunities.value = opportunities.value.map(o => o.opportunitie_id);
  } else {
    selectedOpportunities.value = [];
  }
};

const deleteMultipleOpportunities = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa các cơ hội đã chọn?')) return;
  try {
    await api.delete('/opportunities/delete-multiple', { data: { ids: selectedOpportunities.value } });
    opportunities.value = opportunities.value.filter(o => !selectedOpportunities.value.includes(o.opportunitie_id));
    selectedOpportunities.value = [];
    selectAll.value = false;
  } catch (error) {
    console.error('Lỗi xóa nhiều cơ hội:', error);
    alert('Có lỗi xảy ra khi xóa.');
  }
};

const exportOpportunities = () => {
  const csv = opportunities.value.map(o => `${o.name},${o.value},${o.phase},${getContactName(o.contact_id)}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'opportunities.csv';
  link.click();
};

const getContactName = (contact_id) => {
  const contact = contacts.value.find(c => c.contact_id === contact_id);
  return contact ? contact.name : 'Không có liên hệ';
};


const onFilterChange = () => {
  fetchOpportunities();
};


onMounted(() => {
  fetchOpportunities();
  fetchContacts();
});
</script>
