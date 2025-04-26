<template>
  <header class="site-header" :class="{ sticky: isSticky }">
    <div class="container">
      <nav class="nav">
        <!-- Phần logo hiển thị METAFORMA -->
        <div class="logo">
          <RouterLink to="/dashboard"><Logo/></RouterLink>
        </div>

        <div class="nav-right">
          <ul class="nav-links">
            <li><RouterLink to="/opportunities">Opportunity</RouterLink></li>
            <li><RouterLink to="/tasks">Tasks</RouterLink></li>
            <li><RouterLink to="/contact">Liên hệ</RouterLink></li>
          </ul>

          <!-- Tên user nằm sau menu -->
          <div class="user-name" v-if="user" @click="toggleLogout">
            <Accout />
            <div class="user-name-role">
              <span>{{ user.name }}</span>
              <span class="user-role">{{ user.role }}</span>
            </div>
            <!-- Dropdown menu for logout -->
            <div class="logout" :class="{ show: showLogout }">
              <button @click="logout">Đăng xuất</button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api/axios';
import Logo from '../../components/icons/Logo.vue';
import Accout from '../../components/icons/accout.vue';
import '../../assets/css/Header.css';

const router = useRouter();
const user = ref(null);
const isSticky = ref(false);
const showLogout = ref(false); 


onMounted(async () => {
  try {
    const res = await api.get('/me');
    user.value = res.data;
  } catch (err) {
    router.push('/login');
  }

  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});


const handleScroll = () => {
  isSticky.value = window.scrollY > 50;
};


const toggleLogout = () => {
  showLogout.value = !showLogout.value;
};


const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

