<template>
  <HeaderComponent />
  <div class="dashboard">
    <div class="dashboard-content">
      <h2>Chào mừng!</h2>
      <p v-if="user">Xin chào {{ user.name }} (vai trò: {{ user.role }})</p>
    </div>
  </div>
  <FooterComponent />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '../../api/axios';
import { useRouter } from 'vue-router';

import '../../assets/css/dashboard.css';

import HeaderComponent from '../../components/header/Header.vue';
import FooterComponent from '../../components/footer/Footer.vue';

const user = ref(null);
const router = useRouter();

onMounted(async () => {
  try {
    const res = await api.get('/me');
    console.log('User info:', res.data);
    user.value = res.data;
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error); 
    localStorage.removeItem('token');
    router.push('/login');
  }
});


const logout = async () => {
  await api.post('/logout');  
  localStorage.removeItem('token'); 
  router.push('/login');  
};
</script>
