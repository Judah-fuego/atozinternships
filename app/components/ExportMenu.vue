<script setup lang="ts">
import type { Internship } from '~/data/listings'
import {
  buildSheetRows,
  copyForSheets,
  csvFilename,
  downloadCsv,
  rowsToCsv,
} from '~/utils/exportSheet'

const props = defineProps<{
  listings: Internship[]
  folderLabel: string
}>()

const saved = useSaved()
const store = saved.store
const notice = ref('')

function rows() {
  return buildSheetRows(props.listings, store.value.items)
}

function download() {
  const data = rows()
  downloadCsv(csvFilename(props.folderLabel), rowsToCsv(data, props.folderLabel))
  notice.value = 'Downloaded CSV — open it in Google Sheets or Excel.'
}

async function copy() {
  try {
    await copyForSheets(rows(), props.folderLabel)
    window.open('https://sheets.new', '_blank', 'noopener,noreferrer')
    notice.value = 'Copied. A blank Google Sheet opened — click A1 and paste.'
  }
  catch {
    notice.value = 'Could not copy. Try Download CSV instead.'
  }
}
</script>

<template>
  <div class="export-menu">
    <div class="toolbar">
      <span class="icon-tip-wrap">
        <button
          class="icon-btn"
          type="button"
          aria-label="Download CSV"
          :disabled="!listings.length"
          @click="download"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M8 2v8M5 7.5 8 11l3-3.5M3 13.5h10"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <span
          class="icon-tip"
          aria-hidden="true"
        >Download CSV</span>
      </span>
      <span class="icon-tip-wrap">
        <button
          class="icon-btn"
          type="button"
          aria-label="Copy for Google Sheets"
          :disabled="!listings.length"
          @click="copy"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <rect
              x="2.5"
              y="4.5"
              width="7"
              height="9"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
            />
            <rect
              x="6.5"
              y="2.5"
              width="7"
              height="9"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
            />
          </svg>
        </button>
        <span
          class="icon-tip"
          aria-hidden="true"
        >Copy for Google Sheets</span>
      </span>
    </div>
    <p
      v-if="notice"
      class="notice"
    >
      {{ notice }}
    </p>
  </div>
</template>
