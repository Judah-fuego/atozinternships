<script setup lang="ts">
import { SITE_NAME, siteUrl } from '~/utils/site'

const title = 'How to find internships'
const description = 'A practical guide to finding internships: which websites to use, when summer roles open, and how to track applications without a spreadsheet.'

useSiteSeo({
  title,
  description,
  path: '/guide',
})

useJsonLd('ld-guide', {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I find internships as a college student?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Search open listings on an internship finder, apply on the employer page, and use Handshake for campus-only roles. Keep a folder of the ones you started.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the best website to find internships?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There is not one. Use a finder for public listings, Handshake for school roles, and the company career page when you already know the employer.',
      },
    },
    {
      '@type': 'Question',
      name: 'When should I apply for summer internships?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Start in August through October for the following summer. Keep applying through spring for roles that are still open.',
      },
    },
  ],
})

useJsonLd('ld-guide-howto', {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: title,
  description,
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Search open internships',
      text: 'Filter by role, location, and season, then apply on the company page.',
      url: siteUrl('/'),
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Use the other internship websites',
      text: 'Open Handshake for campus roles, LinkedIn or Indeed for alerts, and company career pages when you know the employer.',
      url: siteUrl('/sources'),
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Track what you apply to',
      text: 'Save each listing to a folder, mark it applying, and put the deadline on it.',
      url: siteUrl('/folders'),
    },
  ],
})

useJsonLd('ld-guide-crumbs', {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: siteUrl('/') },
    { '@type': 'ListItem', position: 2, name: title, item: siteUrl('/guide') },
  ],
})
</script>

<template>
  <article class="page doc-page">
    <h1>How to find internships</h1>
    <p class="lede">
      Most people open Handshake, get overwhelmed, and stop. Search first, then only open the other internship websites for what that search cannot cover.
    </p>

    <h2>Search open listings first</h2>
    <p>
      Start on the
      <NuxtLink to="/">internship finder</NuxtLink>.
      Filter by role, location, season, and whether a posting is still open. Apply on the company page — that is the real application.
    </p>
    <p>
      Save anything you might apply to in a
      <NuxtLink to="/folders">folder</NuxtLink>
      so you are not hunting through browser history later.
    </p>

    <h2>Then use the other internship websites</h2>
    <p>
      No single board has everything.
    </p>
    <ul>
      <li>
        <strong>This site</strong>
        — public lists, Y Combinator, USAJobs, Idealist, and company career boards. No account.
      </li>
      <li>
        <strong>Handshake</strong>
        — campus-only roles. Use your school email.
      </li>
      <li>
        <strong>LinkedIn and Indeed</strong>
        — set alerts, then track the ones you care about here.
      </li>
      <li>
        <strong>Company career pages</strong>
        — if you already know the employer, go straight there.
      </li>
    </ul>
    <p>
      See the
      <NuxtLink to="/sources">internship websites finder</NuxtLink>
      for when to use each one.
    </p>

    <h2>When summer internships open</h2>
    <p>
      For the next summer, the useful window is late summer through fall. A lot of software and finance roles open in July–October and fill before winter break. Spring and government Pathways roles run on their own calendars — check the deadline on the row.
    </p>
    <p>
      If you are late, still apply. Plenty of postings stay open, and off-season internships exist.
    </p>

    <h2>If you do not have experience yet</h2>
    <p>
      Apply anyway to roles that say they want current students. Then fill gaps with a project, a research assistant job, an
      <a
        href="https://www.extern.com/"
        target="_blank"
        rel="noopener noreferrer"
      >Extern</a>
      project, or a smaller company from the list. One finished thing on a resume beats a long note about being passionate.
    </p>

    <h2>Track applications</h2>
    <p>
      When you click apply here, save the row to a folder and mark it applying. Put the deadline on it. That is the whole system — you do not need a spreadsheet unless you want one. You can export a folder to CSV.
    </p>

    <h2>Common questions</h2>
    <h3>How do I find internships as a college student?</h3>
    <p>
      Search open listings, apply on the employer page, and use Handshake for campus-only roles. Keep a folder of the ones you started.
    </p>
    <h3>What is the best website to find internships?</h3>
    <p>
      There is not one. Use a finder for the public listings, Handshake for school roles, and the company site when you know where you want to work.
    </p>
    <h3>When should I apply for summer internships?</h3>
    <p>
      Start in August–October for the following summer. Keep going through spring for roles that are still open.
    </p>
  </article>
</template>
