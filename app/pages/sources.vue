<script setup lang="ts">
import { SITE_NAME, siteUrl } from '~/utils/site'

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
      When a posting publishes a description on Greenhouse, Lever, Ashby, Workday, or USAJobs, we keep a short summary and skill mentions
      so search can find Java, Python, Chinese, and the like. We do not scrape Handshake, LinkedIn, or Indeed.
      Apply on the employer page. These other sites are still worth opening on your own.
      See
      <NuxtLink to="/guide">how to find internships</NuxtLink>
      if you want the order of operations.
    </p>
    <dl class="sources">
      <dt>On this site</dt>
      <dd>
        GitHub internship lists (Pitt CSC / Simplify, engineering, business),
        <a href="https://www.usajobs.gov/" target="_blank" rel="noopener noreferrer">USAJobs</a> college / graduate student Pathways roles,
        <a href="https://www.ycombinator.com/internships" target="_blank" rel="noopener noreferrer">Y Combinator</a> internships,
        <a href="https://www.idealist.org/en/internships" target="_blank" rel="noopener noreferrer">Idealist</a> nonprofit internships,
        and official company career boards (Greenhouse, Lever, Ashby, Workday) for employers the lists often miss.
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

      <dt>Company websites</dt>
      <dd>If you already know the employer, go to their careers page. That is still the source of truth.</dd>
    </dl>
  </div>
</template>
