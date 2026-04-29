<script setup>
</script>

<template>
  <footer class="footer">
    <div class="container">
      <p>页面结构为AI生成</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  padding: 28px 0;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.85rem;
  border-top: 1px solid var(--color-border);
  transition: border-color var(--transition);
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0.4;
}
</style>
