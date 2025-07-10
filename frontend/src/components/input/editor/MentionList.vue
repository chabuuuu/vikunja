<template>
	<div class="dropdown-menu">
		<template v-if="items.length">
			<button
				v-for="(item, index) in items"
				:key="index"
				:class="{ 'is-selected': index === selectedIndex }"
				@click="selectItem(index)"
			>
				{{ item.name || item.username }}
			</button>
		</template>
		<div
			v-else
			class="item"
		>
			No result
		</div>
	</div>
</template>

<script lang="ts">
/* eslint-disable vue/component-api-style */
export default {
	props: {
		items: {
			type: Array,
			required: true,
		},

		command: {
			type: Function,
			required: true,
		},
	},

	data() {
		return {
			selectedIndex: 0,
		}
	},

	watch: {
		items() {
			this.selectedIndex = 0
		},
	},

	methods: {
		onKeyDown({ event }) {
			if (event.key === 'ArrowUp') {
				this.upHandler()
				return true
			}

			if (event.key === 'ArrowDown') {
				this.downHandler()
				return true
			}

			if (event.key === 'Enter') {
				this.enterHandler()
				return true
			}

			return false
		},

		upHandler() {
			this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length
		},

		downHandler() {
			this.selectedIndex = (this.selectedIndex + 1) % this.items.length
		},

		enterHandler() {
			this.selectItem(this.selectedIndex)
		},

		selectItem(index) {
			const item = this.items[index].username

			if (item) {
				this.command({ id: item })
			}
		},
	},
}
</script>

<style lang="scss">
/* Dropdown menu */
.dropdown-menu {
  --gray-1: rgba(61, 37, 20, .05);
  --gray-2: #e0e0e0;
  --gray-3: rgba(61, 37, 20, .12);
  --white: #ffffff;
  --shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: var(--white);
  border: 1px solid var(--gray-1);
  border-radius: 0.7rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: auto;
  padding: 0.4rem;
  position: relative;

  button {
    align-items: center;
    background-color: transparent;
    display: flex;
    gap: 0.25rem;
    text-align: left;
    width: 100%;
    border-radius: 0.4rem;
    border: none;
    padding-block: 0.2rem;

    &:hover,
    &:hover.is-selected {
      background-color: var(--gray-3);
    }

    &.is-selected {
      background-color: var(--gray-2);
    }
  }
}
</style>