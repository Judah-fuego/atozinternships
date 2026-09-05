<script setup lang="ts">
import {
  FAMILY_LABEL,
  FAMILY_ORDER,
  LOCATION_LABEL,
  LOCATION_ORDER,
  TRACK_LABEL,
  facetCounts,
  sidebarFilterCount,
  tracksInFamily,
  uniqueCompanies,
  type Family,
  type Filters,
  type LocationId,
  type PostedWithin,
  type Track,
} from '~/data/listings'

const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const filters = defineModel<Filters>({ required: true })
const expanded = ref<Family[]>([])
const { listings } = useListings()

const activeCount = computed(() => sidebarFilterCount(filters.value))
const selectedTracks = computed(() => new Set(filters.value.tracks ?? []))
const counts = computed(() => facetCounts(listings.value, filters.value))

const locationOptions = computed(() =>
  LOCATION_ORDER.map((id) => ({
    id,
    label: LOCATION_LABEL[id],
    count: counts.value.locations[id] ?? 0,
  })),
)

const companyOptions = computed(() =>
  uniqueCompanies(listings.value).map((name) => ({
    id: name,
    label: name,
    count: counts.value.companies[name] ?? 0,
  })),
)

function formatCount(count: number) {
  return count.toLocaleString()
}

const selectedLocations = computed({
  get: () => filters.value.locations ?? [],
  set: (value: string[]) => {
    filters.value = { ...filters.value, locations: value as LocationId[] }
  },
})

const selectedCompanies = computed({
  get: () => filters.value.companies ?? [],
  set: (value: string[]) => {
    filters.value = { ...filters.value, companies: value }
  },
})

function setWho(who: Filters['who']) {
  filters.value = { ...filters.value, who }
}

function setSeason(season: Filters['season']) {
  filters.value = { ...filters.value, season }
}

function setPosted(posted: PostedWithin) {
  filters.value = { ...filters.value, posted }
}

function setVisa(visa: Filters['visa']) {
  filters.value = { ...filters.value, visa }
}

function setStatus(status: Filters['status']) {
  filters.value = { ...filters.value, status }
}

function toggleExpand(family: Family) {
  expanded.value = expanded.value.includes(family)
    ? expanded.value.filter((item) => item !== family)
    : [...expanded.value, family]
}

function familyTracks(family: Family) {
  return tracksInFamily(family)
}

function familySelectedCount(family: Family) {
  const tracks = familyTracks(family)
  return tracks.filter((track) => selectedTracks.value.has(track)).length
}

function familyAllSelected(family: Family) {
  const tracks = familyTracks(family)
  return tracks.length > 0 && tracks.every((track) => selectedTracks.value.has(track))
}

function toggleTrack(track: Track) {
  const current = filters.value.tracks ?? []
  const next = current.includes(track)
    ? current.filter((item) => item !== track)
    : [...current, track]
  filters.value = { ...filters.value, tracks: next, families: [] }
}

function toggleFamily(family: Family) {
  const tracks = familyTracks(family)
  const current = new Set(filters.value.tracks ?? [])
  if (familyAllSelected(family)) {
    for (const track of tracks) {
      current.delete(track)
    }
  }
  else {
    for (const track of tracks) {
      current.add(track)
    }
  }
  filters.value = { ...filters.value, tracks: [...current], families: [] }
}

function clearFilters() {
  filters.value = {
    query: filters.value.query,
    who: 'all',
    season: 'all',
    posted: 'all',
    status: 'open',
    tracks: [],
    families: [],
    locations: [],
    companies: [],
    visa: 'all',
  }
}
</script>

<template>
  <div
    class="filters-layer"
    :class="{ 'is-open': props.open }"
  >
    <button
      class="filters-backdrop"
      type="button"
      tabindex="-1"
      aria-label="Close filters"
      @click="emit('close')"
    />
    <aside
      class="filters"
      aria-label="Filters"
    >
      <div class="filters-head">
        <strong>Filters</strong>
        <button
          v-if="activeCount"
          class="text-btn"
          type="button"
          @click="clearFilters"
        >
          Clear
        </button>
        <button
          class="filters-close"
          type="button"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="filter-group">
        <span class="filter-label">When</span>
        <div class="filter-options is-inline is-pick">
          <button
            class="chip"
            :class="{ 'is-on': (filters.season ?? 'all') === 'all' }"
            type="button"
            :aria-pressed="(filters.season ?? 'all') === 'all'"
            @click="setSeason('all')"
          >
            All
            <span class="chip-count">{{ formatCount(counts.season.all) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.season === 'summer' }"
            type="button"
            :aria-pressed="filters.season === 'summer'"
            @click="setSeason('summer')"
          >
            Summer
            <span class="chip-count">{{ formatCount(counts.season.summer) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.season === 'offseason' }"
            type="button"
            :aria-pressed="filters.season === 'offseason'"
            @click="setSeason('offseason')"
          >
            Fall / Spring
            <span class="chip-count">{{ formatCount(counts.season.offseason) }}</span>
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Field</span>
        <div
          v-for="family in FAMILY_ORDER"
          :key="family"
          class="field-family"
        >
          <div class="field-row">
            <button
              class="field-expand"
              type="button"
              :aria-expanded="expanded.includes(family)"
              :aria-controls="`field-${family}`"
              @click="toggleExpand(family)"
            >
              <span
                class="field-caret"
                aria-hidden="true"
              />
            </button>
            <button
              class="chip field-parent"
              :class="{
                'is-on': familyAllSelected(family),
                'is-partial': familySelectedCount(family) > 0 && !familyAllSelected(family),
              }"
              type="button"
              :aria-pressed="familyAllSelected(family)"
              @click="toggleFamily(family)"
            >
              {{ FAMILY_LABEL[family] }}
              <span class="chip-count">{{ formatCount(counts.families[family] ?? 0) }}</span>
            </button>
          </div>
          <div
            :id="`field-${family}`"
            class="filter-reveal"
            :class="{ 'is-open': expanded.includes(family) }"
            :inert="!expanded.includes(family)"
          >
            <div class="filter-reveal-inner">
              <div class="filter-sub">
                <button
                  v-for="track in familyTracks(family)"
                  :key="track"
                  class="chip"
                  :class="{ 'is-on': selectedTracks.has(track) }"
                  type="button"
                  :aria-pressed="selectedTracks.has(track)"
                  @click="toggleTrack(track)"
                >
                  {{ TRACK_LABEL[track] }}
                  <span class="chip-count">{{ formatCount(counts.tracks[track] ?? 0) }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Posted</span>
        <div class="filter-options is-inline is-pick">
          <button
            class="chip"
            :class="{ 'is-on': (filters.posted ?? 'all') === 'all' }"
            type="button"
            :aria-pressed="(filters.posted ?? 'all') === 'all'"
            @click="setPosted('all')"
          >
            All
            <span class="chip-count">{{ formatCount(counts.posted.all) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.posted === '1d' }"
            type="button"
            :aria-pressed="filters.posted === '1d'"
            @click="setPosted('1d')"
          >
            1 day
            <span class="chip-count">{{ formatCount(counts.posted['1d']) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.posted === '3d' }"
            type="button"
            :aria-pressed="filters.posted === '3d'"
            @click="setPosted('3d')"
          >
            3 days
            <span class="chip-count">{{ formatCount(counts.posted['3d']) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.posted === '7d' }"
            type="button"
            :aria-pressed="filters.posted === '7d'"
            @click="setPosted('7d')"
          >
            Week
            <span class="chip-count">{{ formatCount(counts.posted['7d']) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.posted === '30d' }"
            type="button"
            :aria-pressed="filters.posted === '30d'"
            @click="setPosted('30d')"
          >
            Month
            <span class="chip-count">{{ formatCount(counts.posted['30d']) }}</span>
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Where</span>
        <FilterSearch
          v-model="selectedLocations"
          :options="locationOptions"
          list-id="location-results"
          placeholder="Search locations…"
        />
      </div>

      <div class="filter-group">
        <span class="filter-label">Company</span>
        <FilterSearch
          v-model="selectedCompanies"
          :options="companyOptions"
          list-id="company-results"
          placeholder="Search companies…"
        />
      </div>

      <div class="filter-group">
        <span class="filter-label">Who</span>
        <div class="filter-options is-inline is-pick">
          <button
            class="chip"
            :class="{ 'is-on': (filters.who ?? 'all') === 'all' }"
            type="button"
            :aria-pressed="(filters.who ?? 'all') === 'all'"
            @click="setWho('all')"
          >
            All
            <span class="chip-count">{{ formatCount(counts.who.all) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.who === 'undergrad' }"
            type="button"
            :aria-pressed="filters.who === 'undergrad'"
            @click="setWho('undergrad')"
          >
            Undergrad
            <span class="chip-count">{{ formatCount(counts.who.undergrad) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.who === 'grad' }"
            type="button"
            :aria-pressed="filters.who === 'grad'"
            @click="setWho('grad')"
          >
            Grad
            <span class="chip-count">{{ formatCount(counts.who.grad) }}</span>
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Visa</span>
        <div class="filter-options is-pick">
          <button
            class="chip"
            :class="{ 'is-on': (filters.visa ?? 'all') === 'all' }"
            type="button"
            :aria-pressed="(filters.visa ?? 'all') === 'all'"
            @click="setVisa('all')"
          >
            All
            <span class="chip-count">{{ formatCount(counts.visa.all) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.visa === 'open' }"
            type="button"
            :aria-pressed="filters.visa === 'open'"
            @click="setVisa('open')"
          >
            No citizenship note
            <span class="chip-count">{{ formatCount(counts.visa.open) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.visa === 'auth' }"
            type="button"
            :aria-pressed="filters.visa === 'auth'"
            @click="setVisa('auth')"
          >
            Work auth
            <span class="chip-count">{{ formatCount(counts.visa.auth) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.visa === 'citizen' }"
            type="button"
            :aria-pressed="filters.visa === 'citizen'"
            @click="setVisa('citizen')"
          >
            U.S. citizens
            <span class="chip-count">{{ formatCount(counts.visa.citizen) }}</span>
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="filter-label">Status</span>
        <div class="filter-options is-pick">
          <button
            class="chip"
            :class="{ 'is-on': (filters.status ?? 'open') === 'open' }"
            type="button"
            :aria-pressed="(filters.status ?? 'open') === 'open'"
            @click="setStatus('open')"
          >
            Open
            <span class="chip-count">{{ formatCount(counts.status.open) }}</span>
          </button>
          <button
            class="chip"
            :class="{ 'is-on': filters.status === 'all' }"
            type="button"
            :aria-pressed="filters.status === 'all'"
            @click="setStatus('all')"
          >
            Include closed
            <span class="chip-count">{{ formatCount(counts.status.all) }}</span>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>
