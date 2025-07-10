<template>
	<BaseButton
		class="menu-bottom-link"
		:href="computedUrl"
		target="_blank"
	>
		EV PMIS
	</BaseButton>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

const computedUrl = 'https://envietgroup.com/'
</script>

<style lang="scss">
.menu-bottom-link {
	color: var(--grey-300);
	text-align: center;
	display: block;
	padding-top: 1rem;
	padding-bottom: 1rem;
	font-size: .8rem;
}
</style>
