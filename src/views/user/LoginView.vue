<template>
  <div class="login-container">
    <h2>Đăng nhập</h2>
    <div class="login-form">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        autofocus
        @keyup.enter="login"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Mật khẩu"
        required
        @keyup.enter="login"
      />
      <button @click="login">Đăng nhập</button>
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>
  </div>
</template>




<script setup>
import { ref } from 'vue';
import api from '../../api/axios';
import { useRouter } from 'vue-router';

// Import file CSS riêng
import '../../assets/css/login.css';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const login = async () => {
  try {
    const res = await api.post('/login', {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Lỗi đăng nhập';
  }
};
</script>
