<script setup lang="ts">
import { queryMatches } from '~/data/listings'
import { companyInternshipBoards } from '~/data/companyBoards'
import { SITE_NAME, siteUrl } from '~/utils/site'

const { listings, load } = useListings()
const query = ref('')
const focused = ref(false)
let blurTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  void load()
})

const boards = computed(() => companyInternshipBoards(listings.value))

function boardMatchScore(company: string, q: string) {
  const name = company.toLowerCase()
  if (name === q) {
    return 0
  }
  if (name.startsWith(q)) {
    return 1
  }
  if (name.includes(q)) {
    return 2
  }
  if (queryMatches(company, q)) {
    return 3
  }
  return 4
}

const matches = computed(() => {
  const q = query.value.trim()
  if (!q) {
    return boards.value.slice(0, 8)
  }
  const needle = q.toLowerCase()
  return boards.value
    .map((row) => ({ row, score: boardMatchScore(row.company, needle) }))
    .filter((item) => item.score < 4)
    .sort((a, b) => a.score - b.score || b.row.count - a.row.count || a.row.company.localeCompare(b.row.company))
    .slice(0, 8)
    .map((item) => item.row)
})

function listingsHref(company: string) {
  return { path: '/', query: { q: company } }
}

function onBlur() {
  clearTimeout(blurTimer)
  blurTimer = setTimeout(() => {
    focused.value = false
  }, 150)
}

onBeforeUnmount(() => {
  clearTimeout(blurTimer)
})

useSiteSeo({
  title: 'Internship websites finder',
  description: 'A finder for internship websites: what we list here, plus Handshake, LinkedIn, Indeed, Y Combinator, USAJobs, and company career pages.',
  path: '/sources',
})

useJsonLd('ld-sources', {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Internship websites',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'atoz internships', url: siteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'Handshake', url: 'https://joinhandshake.com/' },
    { '@type': 'ListItem', position: 3, name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/' },
    { '@type': 'ListItem', position: 4, name: 'Indeed', url: 'https://www.indeed.com/' },
    { '@type': 'ListItem', position: 5, name: 'Y Combinator internships', url: 'https://www.ycombinator.com/internships' },
    { '@type': 'ListItem', position: 6, name: 'USAJobs student internships', url: 'https://www.usajobs.gov/Search/Results?hp=student' },
    { '@type': 'ListItem', position: 7, name: 'Idealist internships', url: 'https://www.idealist.org/en/internships' },
    { '@type': 'ListItem', position: 8, name: 'UN Careers internships', url: 'https://careers.un.org/jobsearch' },
    { '@type': 'ListItem', position: 9, name: 'UN Volunteers', url: 'https://app.unv.org/explore/assignments' },
  ],
})

useJsonLd('ld-sources-crumbs', {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: siteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'Internship websites', item: siteUrl('/sources') },
  ],
})
</script>

<template>
  <div class="page doc-page">
    <h1>Internship websites</h1>
    <p class="lede">
      A short finder for the internship websites worth using. We ingest public lists and official APIs.
      When a posting publishes a description on Greenhouse, Lever, Ashby, Workday, Oracle Cloud, or USAJobs, we keep a short summary, skill mentions,
      pay when disclosed, and hard requirements (degree / graduation) from the official apply page.
      so search can find Java, Python, Chinese, and the like. We do not scrape Handshake, LinkedIn, or Indeed.
      Apply on the employer page. These other sites are still worth opening on your own.
      See
      <NuxtLink to="/guide">how to find internships</NuxtLink>
      if you want the order of operations.
    </p>

    <h2>Company internship boards</h2>
    <p>
      Look up an employer and open their internship board — the actual jobs, not a search page.
      Search covers Google, NVIDIA, Johnson &amp; Johnson, Ford, GM, Toyota, Honda, Rivian, UN Volunteers, and the other boards we scrape.
      If we already have rows for them, you can jump to those too.
    </p>
    <div class="board-lookup">
      <input
        class="search"
        type="text"
        placeholder="Search companies…"
        :value="query"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        @focus="focused = true"
        @blur="onBlur"
        @input="query = ($event.target as HTMLInputElement).value"
      >
      <ul
        v-if="focused || query.trim()"
        class="board-lookup-list"
      >
        <li
          v-for="row in matches"
          :key="row.company"
        >
          <a
            :href="row.boardUrl"
            target="_blank"
            rel="noopener noreferrer"
          >{{ row.company }}</a>
          <span class="board-lookup-meta">
            internship board
            <template v-if="row.count">
              ·
              <NuxtLink :to="listingsHref(row.company)">{{ row.count.toLocaleString() }} here</NuxtLink>
            </template>
          </span>
        </li>
        <li
          v-if="!matches.length"
          class="board-lookup-empty"
        >
          No company board for that name
        </li>
      </ul>
    </div>

    <dl class="sources">
      <dt>On this site</dt>
      <dd>
        GitHub internship lists (Pitt CSC / Simplify, engineering, business),
        <a href="https://www.usajobs.gov/" target="_blank" rel="noopener noreferrer">USAJobs</a> college / graduate student Pathways roles,
        <a href="https://www.ycombinator.com/internships" target="_blank" rel="noopener noreferrer">Y Combinator</a> internships,
        <a href="https://www.idealist.org/en/internships" target="_blank" rel="noopener noreferrer">Idealist</a> nonprofit internships,
        official company career boards (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Ford, Rivian) for employers the lists often miss,
        plus
        <a href="https://careers.un.org/jobsearch" target="_blank" rel="noopener noreferrer">UN Careers</a>
        internships and
        <a href="https://app.unv.org/explore/assignments" target="_blank" rel="noopener noreferrer">UN Volunteers</a>.
      </dd>

      <dt>
        <a href="https://joinhandshake.com/" target="_blank" rel="noopener noreferrer">Handshake</a>
        · school career site
      </dt>
      <dd>Campus-exclusive postings. Needs your school email. Start here for local and alumni roles.</dd>

      <dt>
        <a href="https://www.linkedin.com/jobs/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        ·
        <a href="https://www.indeed.com/" target="_blank" rel="noopener noreferrer">Indeed</a>
      </dt>
      <dd>Huge boards. Use them for alerts, then track the ones you care about in a folder here.</dd>

      <dt>
        <a href="https://www.ycombinator.com/internships" target="_blank" rel="noopener noreferrer">Y Combinator</a>
      </dt>
      <dd>Curated startup internships from the YC internships page, plus intern rows on Work at a Startup.</dd>

      <dt>
        <a href="https://www.usajobs.gov/Search/Results?hp=student" target="_blank" rel="noopener noreferrer">USAJobs</a>
      </dt>
      <dd>Federal Pathways and student trainee internships for current undergrads and grad students. Many require U.S. citizenship — that shows on the row.</dd>

      <dt>
        <a href="https://www.idealist.org/en/internships" target="_blank" rel="noopener noreferrer">Idealist</a>
      </dt>
      <dd>U.S. nonprofit internships with a working apply link. Due dates show when the posting publishes one.</dd>

      <dt>
        <a href="https://www.wayup.com/" target="_blank" rel="noopener noreferrer">WayUp</a>
        ·
        <a href="https://www.extern.com/" target="_blank" rel="noopener noreferrer">Extern</a>
      </dt>
      <dd>WayUp for brand-name early career roles. Extern for project-based experience if you need something on your resume first.</dd>

      <dt>
        <a href="https://www.trueup.io/" target="_blank" rel="noopener noreferrer">TrueUp</a>
        ·
        <a href="https://www.coolworks.com/" target="_blank" rel="noopener noreferrer">CoolWorks</a>
      </dt>
      <dd>TrueUp for tech startups. CoolWorks for parks, resorts, and seasonal outdoor work.</dd>

      <dt>
        <a href="https://careers.un.org/jobsearch" target="_blank" rel="noopener noreferrer">UN Careers</a>
        ·
        <a href="https://app.unv.org/explore/assignments" target="_blank" rel="noopener noreferrer">UN Volunteers</a>
      </dt>
      <dd>
        Official UN internships (often unpaid, worldwide) and UNV university, youth, and online volunteer assignments.
        Apply on Inspira or the Unified Volunteering Platform — you need a profile first.
      </dd>

      <dt>Company websites</dt>
      <dd>If you already know the employer, use the lookup above. That opens their internship board when we have one — including pharma (J&amp;J, Lilly, GSK, AbbVie) and auto (Ford, GM, Toyota, Honda, Rivian, Tesla).</dd>
    </dl>
  </div>
</template>
