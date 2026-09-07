/**
 * Official internship / early-career boards we scrape or link.
 * Workday / ATS / Phenom / Rivian / ReliefWeb rows have scrape fields.
 * Everyone has a public boardUrl so the sources lookup works before a scrape.
 * Mega harvest from listings + curated employers lives in scripts/mega-boards.json.
 */

export const CAREER_BOARDS = [
  {
    company: 'Google',
    sector: 'tech',
    kind: 'custom',
    boardUrl: 'https://www.google.com/about/careers/applications/jobs/results/?q=intern'
  },
  {
    company: 'NVIDIA',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nvidia.wd5.myworkdayjobs.com',
    tenant: 'nvidia',
    site: 'NVIDIAExternalCareerSite',
    boardUrl: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=intern'
  },
  {
    company: 'Amazon',
    sector: 'tech',
    kind: 'custom',
    boardUrl: 'https://www.amazon.jobs/en/search?base_query=intern'
  },
  {
    company: 'Meta',
    sector: 'tech',
    kind: 'custom',
    boardUrl: 'https://www.metacareers.com/careerprograms/students'
  },
  {
    company: 'Intel',
    sector: 'tech',
    kind: 'workday',
    host: 'https://intel.wd1.myworkdayjobs.com',
    tenant: 'intel',
    site: 'External',
    boardUrl: 'https://intel.wd1.myworkdayjobs.com/External?q=intern'
  },
  {
    company: 'Microsoft',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://apply.careers.microsoft.com/careers?query=intern'
  },
  {
    company: 'Apple',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://jobs.apple.com/en-us/search?search=intern&sort=relevance'
  },
  {
    company: 'Johnson & Johnson',
    sector: 'pharma',
    kind: 'workday',
    host: 'https://jj.wd5.myworkdayjobs.com',
    tenant: 'jj',
    site: 'JJ',
    boardUrl: 'https://jj.wd5.myworkdayjobs.com/en-US/JJ?q=intern'
  },
  {
    company: 'Abbott',
    sector: 'pharma',
    kind: 'workday',
    host: 'https://abbott.wd5.myworkdayjobs.com',
    tenant: 'abbott',
    site: 'abbottcareers',
    boardUrl: 'https://abbott.wd5.myworkdayjobs.com/abbottcareers?q=intern'
  },
  {
    company: 'Eli Lilly',
    sector: 'pharma',
    kind: 'workday',
    host: 'https://lilly.wd115.myworkdayjobs.com',
    tenant: 'lilly',
    site: 'LLY',
    boardUrl: 'https://lilly.wd115.myworkdayjobs.com/LLY?q=intern'
  },
  {
    company: 'GSK',
    sector: 'pharma',
    kind: 'workday',
    host: 'https://gsk.wd5.myworkdayjobs.com',
    tenant: 'gsk',
    site: 'GSKCareers',
    boardUrl: 'https://gsk.wd5.myworkdayjobs.com/GSKCareers?q=intern'
  },
  {
    company: 'Novartis',
    sector: 'pharma',
    kind: 'workday',
    host: 'https://novartis.wd3.myworkdayjobs.com',
    tenant: 'novartis',
    site: 'Novartis_Careers',
    boardUrl: 'https://novartis.wd3.myworkdayjobs.com/Novartis_Careers?q=intern'
  },
  {
    company: 'AbbVie',
    sector: 'pharma',
    kind: 'smartrecruiters',
    board: 'AbbVie',
    boardUrl: 'https://jobs.smartrecruiters.com/AbbVie?q=intern'
  },
  {
    company: 'Pfizer',
    sector: 'pharma',
    kind: 'link',
    boardUrl: 'https://pfizer.wd1.myworkdayjobs.com/PfizerCareers?q=intern'
  },
  {
    company: 'Merck',
    sector: 'pharma',
    kind: 'link',
    boardUrl: 'https://msd.wd5.myworkdayjobs.com/SearchJobs?q=intern'
  },
  {
    company: 'Amgen',
    sector: 'pharma',
    kind: 'link',
    boardUrl: 'https://amgen.wd1.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'Roche',
    sector: 'pharma',
    kind: 'link',
    boardUrl: 'https://roche.wd3.myworkdayjobs.com/roche-ext?q=intern'
  },
  {
    company: 'Sanofi',
    sector: 'pharma',
    kind: 'link',
    boardUrl: 'https://sanofi.wd3.myworkdayjobs.com/SanofiCareers?q=intern'
  },
  {
    company: 'Ford',
    sector: 'auto',
    kind: 'ford',
    boardUrl: 'https://www.careers.ford.com/search-jobs/intern'
  },
  {
    company: 'General Motors',
    sector: 'auto',
    kind: 'workday',
    host: 'https://generalmotors.wd5.myworkdayjobs.com',
    tenant: 'generalmotors',
    site: 'Careers_GM',
    boardUrl: 'https://generalmotors.wd5.myworkdayjobs.com/Careers_GM?q=intern'
  },
  {
    company: 'Magna',
    sector: 'auto',
    kind: 'workday',
    host: 'https://magna.wd3.myworkdayjobs.com',
    tenant: 'magna',
    site: 'Magna',
    boardUrl: 'https://magna.wd3.myworkdayjobs.com/Magna?q=intern'
  },
  {
    company: 'Honda',
    sector: 'auto',
    kind: 'phenom',
    origin: 'https://careers.honda.com',
    locale: 'us/en',
    boardUrl: 'https://careers.honda.com/us/en/search-results?keywords=intern'
  },
  {
    company: 'Toyota',
    sector: 'auto',
    kind: 'phenom',
    origin: 'https://careers.toyota.com',
    locale: 'us/en',
    boardUrl: 'https://careers.toyota.com/us/en/search-results?keywords=intern'
  },
  {
    company: 'Toyota Research Institute',
    sector: 'auto',
    kind: 'lever',
    board: 'tri',
    boardUrl: 'https://jobs.lever.co/tri'
  },
  {
    company: 'Woven by Toyota',
    sector: 'auto',
    kind: 'lever',
    board: 'woven-by-toyota',
    boardUrl: 'https://jobs.lever.co/woven-by-toyota'
  },
  {
    company: 'Tesla',
    sector: 'auto',
    kind: 'link',
    boardUrl: 'https://www.tesla.com/careers/search/?query=intern'
  },
  {
    company: 'Rivian',
    sector: 'auto',
    kind: 'rivian',
    boardUrl: 'https://careers.rivian.com/careers-home/jobs?keywords=intern'
  },
  {
    company: 'Rivian and Volkswagen Group Technologies',
    sector: 'auto',
    kind: 'ashby',
    board: 'rivianvw.tech',
    boardUrl: 'https://jobs.ashbyhq.com/rivianvw.tech'
  },
  {
    company: 'Lucid Motors',
    sector: 'auto',
    kind: 'greenhouse',
    board: 'lucidmotors',
    boardUrl: 'https://job-boards.greenhouse.io/lucidmotors'
  },
  {
    company: 'Waymo',
    sector: 'auto',
    kind: 'greenhouse',
    board: 'waymo',
    boardUrl: 'https://job-boards.greenhouse.io/waymo'
  },
  {
    company: 'Stellantis',
    sector: 'auto',
    kind: 'link',
    boardUrl: 'https://careers.stellantis.com/go/Internships-and-Graduate-Programs/8727900/'
  },
  {
    company: 'United Nations',
    sector: 'un',
    kind: 'reliefweb',
    query: 'internship',
    boardUrl: 'https://careers.un.org/jobsearch'
  },
  {
    company: 'UN Volunteers',
    sector: 'un',
    kind: 'reliefweb',
    query: 'volunteer',
    boardUrl: 'https://app.unv.org/explore/assignments'
  },
  {
    company: 'PwC',
    sector: 'consulting',
    kind: 'phenom',
    origin: 'https://jobs-us.pwc.com',
    locale: 'us/en',
    boardUrl: 'https://jobs-us.pwc.com/us/en/search-results?keywords=intern'
  },
  {
    company: 'Accenture',
    sector: 'consulting',
    kind: 'workday',
    host: 'https://accenture.wd103.myworkdayjobs.com',
    tenant: 'accenture',
    site: 'AccentureCareers',
    boardUrl: 'https://accenture.wd103.myworkdayjobs.com/AccentureCareers?q=intern'
  },
  {
    company: 'General Mills',
    sector: 'consumer',
    kind: 'workday',
    host: 'https://genmills.wd1.myworkdayjobs.com',
    tenant: 'genmills',
    site: 'GMI_External_Careers',
    boardUrl: 'https://genmills.wd1.myworkdayjobs.com/GMI_External_Careers?q=intern'
  },
  {
    company: 'Unilever',
    sector: 'consumer',
    kind: 'workday',
    host: 'https://unilever.wd3.myworkdayjobs.com',
    tenant: 'unilever',
    site: 'Unilever_Experienced_Professionals',
    boardUrl: 'https://unilever.wd3.myworkdayjobs.com/Unilever_Experienced_Professionals?q=intern'
  },
  {
    company: 'Shell',
    sector: 'energy',
    kind: 'workday',
    host: 'https://shell.wd3.myworkdayjobs.com',
    tenant: 'shell',
    site: 'ShellCareers',
    boardUrl: 'https://shell.wd3.myworkdayjobs.com/ShellCareers?q=intern'
  },
  {
    company: 'Vertex Pharmaceuticals',
    sector: 'healthcare',
    kind: 'workday',
    host: 'https://vrtx.wd501.myworkdayjobs.com',
    tenant: 'vrtx',
    site: 'vertex_careers',
    boardUrl: 'https://vrtx.wd501.myworkdayjobs.com/vertex_careers?q=intern'
  },
  {
    company: 'ExxonMobil',
    sector: 'energy',
    kind: 'custom',
    boardUrl: 'https://jobs.exxonmobil.com/search/?q=intern'
  },
  {
    company: 'Two Sigma',
    sector: 'finance',
    kind: 'custom',
    boardUrl: 'https://careers.twosigma.com/'
  },
  {
    company: 'Goldman Sachs',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.goldmansachs.com/careers/students/programs-and-internships'
  },
  {
    company: 'Morgan Stanley',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://morganstanley.tal.net/vx/lang-en-GB/mobile-0/brand-2/candidate'
  },
  {
    company: 'Bank of America',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://careers.bankofamerica.com/en-us/students'
  },
  {
    company: 'Wells Fargo',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.wellsfargojobs.com/en/early-careers/'
  },
  {
    company: 'Blackstone',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.blackstone.com/careers/students/'
  },
  {
    company: 'Fidelity',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://jobs.fidelity.com/en/students/'
  },
  {
    company: 'JPMorgan Chase',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.jpmorganchase.com/careers/explore-opportunities/students-and-graduates'
  },
  {
    company: 'McKinsey & Company',
    sector: 'consulting',
    kind: 'link',
    boardUrl: 'https://www.mckinsey.com/careers/search-jobs'
  },
  {
    company: 'Boston Consulting Group',
    sector: 'consulting',
    kind: 'link',
    boardUrl: 'https://careers.bcg.com'
  },
  {
    company: 'Bain & Company',
    sector: 'consulting',
    kind: 'link',
    boardUrl: 'https://www.bain.com/careers/'
  },
  {
    company: 'Deloitte',
    sector: 'consulting',
    kind: 'link',
    boardUrl: 'https://apply.deloitte.com/careers/SearchJobs/?9339=[478]&9339_format=5915&listFilterMode=1&jobRecordsPerPage=10&sort=relevancy'
  },
  {
    company: 'EY',
    sector: 'consulting',
    kind: 'link',
    boardUrl: 'https://www.ey.com/en_us/careers/internships-student-programs'
  },
  {
    company: 'KPMG',
    sector: 'consulting',
    kind: 'link',
    boardUrl: 'https://uskpmgats.avature.net/campus'
  },
  {
    company: 'Walmart',
    sector: 'consumer',
    kind: 'link',
    boardUrl: 'https://careers.walmart.com/us/en/home/careers-areas/students'
  },
  {
    company: 'PepsiCo',
    sector: 'consumer',
    kind: 'link',
    boardUrl: 'https://www.pepsicojobs.com/main/jobs?keywords=Intern'
  },
  {
    company: 'The Coca-Cola Company',
    sector: 'consumer',
    kind: 'link',
    boardUrl: 'https://www.coca-colacompany.com/careers/early-careers'
  },
  {
    company: 'Starbucks',
    sector: 'consumer',
    kind: 'link',
    boardUrl: 'https://careers.starbucks.com/discover-opportunities/internships/'
  },
  {
    company: 'Enterprise Mobility',
    sector: 'consumer',
    kind: 'link',
    boardUrl: 'https://www.enterprisemobility.com/en/careers.html'
  },
  {
    company: 'Mondelez International',
    sector: 'consumer',
    kind: 'link',
    boardUrl: 'https://www.mondelezinternational.com/careers/'
  },
  {
    company: 'Lockheed Martin',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://www.lockheedmartinjobs.com/search-jobs/intern/694/1'
  },
  {
    company: 'NASA',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://stemgateway.nasa.gov'
  },
  {
    company: 'The Aerospace Corporation',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://aerospace.org/students-and-recent-graduates'
  },
  {
    company: 'General Dynamics',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://www.gd.com/careers/interns'
  },
  {
    company: 'Airbus',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://www.airbus.com/en/careers/students-and-graduates'
  },
  {
    company: 'HII',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://hii.com/careers/'
  },
  {
    company: 'Halliburton',
    sector: 'energy',
    kind: 'link',
    boardUrl: 'https://jobs.halliburton.com'
  },
  {
    company: 'Dow',
    sector: 'energy',
    kind: 'workday',
    host: 'https://dow.wd1.myworkdayjobs.com',
    tenant: 'dow',
    site: 'ExternalCareers',
    boardUrl: 'https://dow.wd1.myworkdayjobs.com/ExternalCareers?q=intern'
  },
  {
    company: 'Marathon Petroleum',
    sector: 'energy',
    kind: 'link',
    boardUrl: 'https://jobs.marathonpetroleum.com'
  },
  {
    company: 'Occidental',
    sector: 'energy',
    kind: 'link',
    boardUrl: 'https://careers.oxy.com'
  },
  {
    company: 'UnitedHealth Group',
    sector: 'healthcare',
    kind: 'link',
    boardUrl: 'https://www.unitedhealthgroup.com/careers/en/work/early-careers.html'
  },
  {
    company: 'Regeneron',
    sector: 'healthcare',
    kind: 'link',
    boardUrl: 'https://careers.regeneron.com/en/career-pathways/early-careers/'
  },
  {
    company: 'McKesson',
    sector: 'healthcare',
    kind: 'link',
    boardUrl: 'https://careers.mckesson.com/en/early-talent'
  },
  {
    company: 'Kaiser Permanente',
    sector: 'healthcare',
    kind: 'link',
    boardUrl: 'https://www.kaiserpermanentejobs.org'
  },
  {
    company: 'CIA',
    sector: 'government',
    kind: 'link',
    boardUrl: 'https://www.cia.gov/careers/student-programs/'
  },
  {
    company: 'World Bank',
    sector: 'government',
    kind: 'link',
    boardUrl: 'https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers'
  },
  {
    company: 'Visa',
    sector: 'other',
    kind: 'link',
    boardUrl: 'https://usa.visa.com/careers.html'
  },
  {
    company: 'IBM',
    sector: 'other',
    kind: 'link',
    boardUrl: 'https://www.ibm.com/careers/internships'
  },

  // Mega harvest — confirmed public ATS/Workday boards from listings + curated employers
  {
    company: 'ABB',
    sector: 'tech',
    kind: 'workday',
    host: 'https://abb.wd3.myworkdayjobs.com',
    tenant: 'abb',
    site: 'external_career_page',
    boardUrl: 'https://abb.wd3.myworkdayjobs.com/external_career_page?q=intern'
  },
  {
    company: 'Acceldata',
    sector: 'tech',
    kind: 'lever',
    board: 'acceldata',
    boardUrl: 'https://jobs.lever.co/acceldata'
  },
  {
    company: 'AeroVironment',
    sector: 'aerospace',
    kind: 'workday',
    host: 'https://avav.wd1.myworkdayjobs.com',
    tenant: 'avav',
    site: 'avav',
    boardUrl: 'https://avav.wd1.myworkdayjobs.com/avav?q=intern'
  },
  {
    company: 'AIG',
    sector: 'tech',
    kind: 'workday',
    host: 'https://aig.wd1.myworkdayjobs.com',
    tenant: 'aig',
    site: 'AIG',
    boardUrl: 'https://aig.wd1.myworkdayjobs.com/AIG?q=intern'
  },
  {
    company: 'Akuna Capital',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://akunacapital.com/careers'
  },
  {
    company: 'Albedo',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'albedo',
    boardUrl: 'https://job-boards.greenhouse.io/albedo'
  },
  {
    company: 'Allegion',
    sector: 'tech',
    kind: 'workday',
    host: 'https://allegion.wd5.myworkdayjobs.com',
    tenant: 'allegion',
    site: 'careers',
    boardUrl: 'https://allegion.wd5.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Allium',
    sector: 'tech',
    kind: 'ashby',
    board: 'allium',
    boardUrl: 'https://jobs.ashbyhq.com/allium'
  },
  {
    company: 'Ambarella',
    sector: 'tech',
    kind: 'workday',
    host: 'https://ambarella.wd108.myworkdayjobs.com',
    tenant: 'ambarella',
    site: 'ambarella',
    boardUrl: 'https://ambarella.wd108.myworkdayjobs.com/ambarella?q=intern'
  },
  {
    company: 'Amcor',
    sector: 'tech',
    kind: 'workday',
    host: 'https://amcor.wd5.myworkdayjobs.com',
    tenant: 'amcor',
    site: 'amcor_external_career_site',
    boardUrl: 'https://amcor.wd5.myworkdayjobs.com/amcor_external_career_site?q=intern'
  },
  {
    company: 'AMD',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://amd.wd1.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Amentum',
    sector: 'tech',
    kind: 'workday',
    host: 'https://pae.wd1.myworkdayjobs.com',
    tenant: 'pae',
    site: 'amentum_careers',
    boardUrl: 'https://pae.wd1.myworkdayjobs.com/amentum_careers?q=intern'
  },
  {
    company: 'American Express',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://aexp.wd1.myworkdayjobs.com/campus?q=intern'
  },
  {
    company: 'Ameriprise Financial',
    sector: 'finance',
    kind: 'workday',
    host: 'https://ameriprise.wd5.myworkdayjobs.com',
    tenant: 'ameriprise',
    site: 'Ameriprise',
    boardUrl: 'https://ameriprise.wd5.myworkdayjobs.com/Ameriprise?q=intern'
  },
  {
    company: 'Analog Devices',
    sector: 'tech',
    kind: 'workday',
    host: 'https://analogdevices.wd1.myworkdayjobs.com',
    tenant: 'analogdevices',
    site: 'External',
    boardUrl: 'https://analogdevices.wd1.myworkdayjobs.com/External?q=intern'
  },
  {
    company: 'Ancestry',
    sector: 'tech',
    kind: 'workday',
    host: 'https://ancestry.wd501.myworkdayjobs.com',
    tenant: 'ancestry',
    site: 'Careers',
    boardUrl: 'https://ancestry.wd501.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'Anthelion Capital',
    sector: 'finance',
    kind: 'ashby',
    board: 'anthelioncap',
    boardUrl: 'https://jobs.ashbyhq.com/anthelioncap'
  },
  {
    company: 'Apex Technology',
    sector: 'tech',
    kind: 'ashby',
    board: 'apex-technology-inc',
    boardUrl: 'https://jobs.ashbyhq.com/apex-technology-inc'
  },
  {
    company: 'Appian',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'appian',
    boardUrl: 'https://job-boards.greenhouse.io/appian'
  },
  {
    company: 'Applied Intuition',
    sector: 'auto',
    kind: 'ashby',
    board: 'applied',
    boardUrl: 'https://jobs.ashbyhq.com/applied'
  },
  {
    company: 'Apptronik',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'apptronik',
    boardUrl: 'https://job-boards.greenhouse.io/apptronik'
  },
  {
    company: 'Aptiv',
    sector: 'tech',
    kind: 'workday',
    host: 'https://aptiv.wd5.myworkdayjobs.com',
    tenant: 'aptiv',
    site: 'aptiv_careers',
    boardUrl: 'https://aptiv.wd5.myworkdayjobs.com/aptiv_careers?q=intern'
  },
  {
    company: 'Aquatic',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'aquaticcapitalmanagement',
    boardUrl: 'https://job-boards.greenhouse.io/aquaticcapitalmanagement'
  },
  {
    company: 'Arch Capital Group',
    sector: 'finance',
    kind: 'workday',
    host: 'https://archgroup.wd1.myworkdayjobs.com',
    tenant: 'archgroup',
    site: 'careers',
    boardUrl: 'https://archgroup.wd1.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Argmax',
    sector: 'auto',
    kind: 'greenhouse',
    board: 'argmax',
    boardUrl: 'https://job-boards.greenhouse.io/argmax'
  },
  {
    company: 'Arlo Technologies',
    sector: 'tech',
    kind: 'workday',
    host: 'https://arlo.wd12.myworkdayjobs.com',
    tenant: 'arlo',
    site: 'External_Careers',
    boardUrl: 'https://arlo.wd12.myworkdayjobs.com/External_Careers?q=intern'
  },
  {
    company: 'ASM Global',
    sector: 'tech',
    kind: 'workday',
    host: 'https://asmglobal.wd1.myworkdayjobs.com',
    tenant: 'asmglobal',
    site: 'careers',
    boardUrl: 'https://asmglobal.wd1.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Astera',
    sector: 'tech',
    kind: 'ashby',
    board: 'astera',
    boardUrl: 'https://jobs.ashbyhq.com/astera'
  },
  {
    company: 'Astera Labs',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'asteraearlycareer2026',
    boardUrl: 'https://job-boards.greenhouse.io/asteraearlycareer2026'
  },
  {
    company: 'AstraZeneca',
    sector: 'tech',
    kind: 'workday',
    host: 'https://astrazeneca.wd3.myworkdayjobs.com',
    tenant: 'astrazeneca',
    site: 'Careers',
    boardUrl: 'https://astrazeneca.wd3.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'Atoms',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'cssmerge',
    boardUrl: 'https://job-boards.greenhouse.io/cssmerge'
  },
  {
    company: 'Auctor',
    sector: 'tech',
    kind: 'ashby',
    board: 'auctor',
    boardUrl: 'https://jobs.ashbyhq.com/auctor'
  },
  {
    company: 'Audax Group',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'audaxgroup',
    boardUrl: 'https://job-boards.greenhouse.io/audaxgroup'
  },
  {
    company: 'Avery Dennison',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'AveryDennison',
    boardUrl: 'https://jobs.smartrecruiters.com/AveryDennison'
  },
  {
    company: 'Axon',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'axontalentcommunity',
    boardUrl: 'https://job-boards.greenhouse.io/axontalentcommunity'
  },
  {
    company: 'Base Power',
    sector: 'tech',
    kind: 'ashby',
    board: 'base-power',
    boardUrl: 'https://jobs.ashbyhq.com/base-power'
  },
  {
    company: 'Beacon Software',
    sector: 'tech',
    kind: 'ashby',
    board: 'beaconsoftware',
    boardUrl: 'https://jobs.ashbyhq.com/beaconsoftware'
  },
  {
    company: 'Belvedere Trading',
    sector: 'finance',
    kind: 'lever',
    board: 'belvederetrading',
    boardUrl: 'https://jobs.lever.co/belvederetrading'
  },
  {
    company: 'Bio-Techne',
    sector: 'tech',
    kind: 'workday',
    host: 'https://biotechne.wd5.myworkdayjobs.com',
    tenant: 'biotechne',
    site: 'Biotechne',
    boardUrl: 'https://biotechne.wd5.myworkdayjobs.com/Biotechne?q=intern'
  },
  {
    company: 'Blue Origin',
    sector: 'aerospace',
    kind: 'workday',
    host: 'https://blueorigin.wd5.myworkdayjobs.com',
    tenant: 'blueorigin',
    site: 'blueorigin',
    boardUrl: 'https://blueorigin.wd5.myworkdayjobs.com/blueorigin?q=intern'
  },
  {
    company: 'Booz Allen',
    sector: 'consulting',
    kind: 'workday',
    host: 'https://bah.wd1.myworkdayjobs.com',
    tenant: 'bah',
    site: 'bah_jobs',
    boardUrl: 'https://bah.wd1.myworkdayjobs.com/bah_jobs?q=intern'
  },
  {
    company: 'BorgWarner',
    sector: 'tech',
    kind: 'workday',
    host: 'https://borgwarner.wd5.myworkdayjobs.com',
    tenant: 'borgwarner',
    site: 'BorgWarner_Careers',
    boardUrl: 'https://borgwarner.wd5.myworkdayjobs.com/BorgWarner_Careers?q=intern'
  },
  {
    company: 'Bosch Group',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'BoschGroup',
    boardUrl: 'https://jobs.smartrecruiters.com/BoschGroup'
  },
  {
    company: 'Bot Auto',
    sector: 'auto',
    kind: 'greenhouse',
    board: 'botauto',
    boardUrl: 'https://job-boards.greenhouse.io/botauto'
  },
  {
    company: 'Brunswick',
    sector: 'tech',
    kind: 'workday',
    host: 'https://brunswick.wd1.myworkdayjobs.com',
    tenant: 'brunswick',
    site: 'search',
    boardUrl: 'https://brunswick.wd1.myworkdayjobs.com/search?q=intern'
  },
  {
    company: 'CACI',
    sector: 'aerospace',
    kind: 'workday',
    host: 'https://caci.wd1.myworkdayjobs.com',
    tenant: 'caci',
    site: 'external',
    boardUrl: 'https://caci.wd1.myworkdayjobs.com/external?q=intern'
  },
  {
    company: 'Cadence Design Systems',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cadence.wd1.myworkdayjobs.com',
    tenant: 'cadence',
    site: 'External_Careers',
    boardUrl: 'https://cadence.wd1.myworkdayjobs.com/External_Careers?q=intern'
  },
  {
    company: 'CAE',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cae.wd3.myworkdayjobs.com',
    tenant: 'cae',
    site: 'career',
    boardUrl: 'https://cae.wd3.myworkdayjobs.com/career?q=intern'
  },
  {
    company: 'Campbell Soup Company',
    sector: 'tech',
    kind: 'workday',
    host: 'https://campbellsoup.wd5.myworkdayjobs.com',
    tenant: 'campbellsoup',
    site: 'externalcareers_globalsite',
    boardUrl: 'https://campbellsoup.wd5.myworkdayjobs.com/externalcareers_globalsite?q=intern'
  },
  {
    company: 'Canva',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'Canva',
    boardUrl: 'https://jobs.smartrecruiters.com/Canva'
  },
  {
    company: 'Capital One',
    sector: 'finance',
    kind: 'workday',
    host: 'https://capitalone.wd12.myworkdayjobs.com',
    tenant: 'capitalone',
    site: 'Capital_One',
    boardUrl: 'https://capitalone.wd12.myworkdayjobs.com/Capital_One?q=intern'
  },
  {
    company: 'Cardinal Health',
    sector: 'healthcare',
    kind: 'workday',
    host: 'https://cardinalhealth.wd1.myworkdayjobs.com',
    tenant: 'cardinalhealth',
    site: 'EXT',
    boardUrl: 'https://cardinalhealth.wd1.myworkdayjobs.com/EXT?q=intern'
  },
  {
    company: 'Carnegie Mellon SEI',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cmu.wd115.myworkdayjobs.com',
    tenant: 'cmu',
    site: 'SEI',
    boardUrl: 'https://cmu.wd115.myworkdayjobs.com/SEI?q=intern'
  },
  {
    company: 'Carnegie Mellon University',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cmu.wd115.myworkdayjobs.com',
    tenant: 'cmu',
    site: 'CMU',
    boardUrl: 'https://cmu.wd115.myworkdayjobs.com/CMU?q=intern'
  },
  {
    company: 'Caterpillar',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cat.wd5.myworkdayjobs.com',
    tenant: 'cat',
    site: 'CaterpillarCareers',
    boardUrl: 'https://cat.wd5.myworkdayjobs.com/CaterpillarCareers?q=intern'
  },
  {
    company: 'Celonis',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'celonis',
    boardUrl: 'https://job-boards.greenhouse.io/celonis'
  },
  {
    company: 'Centerfield',
    sector: 'tech',
    kind: 'ashby',
    board: 'centerfield',
    boardUrl: 'https://jobs.ashbyhq.com/centerfield'
  },
  {
    company: 'Centific',
    sector: 'tech',
    kind: 'workday',
    host: 'https://centific.wd1.myworkdayjobs.com',
    tenant: 'centific',
    site: 'Centific_Global',
    boardUrl: 'https://centific.wd1.myworkdayjobs.com/Centific_Global?q=intern'
  },
  {
    company: 'CertiK',
    sector: 'aerospace',
    kind: 'lever',
    board: 'certik',
    boardUrl: 'https://jobs.lever.co/certik'
  },
  {
    company: 'CesiumAstro',
    sector: 'tech',
    kind: 'lever',
    board: 'CesiumAstro',
    boardUrl: 'https://jobs.lever.co/CesiumAstro'
  },
  {
    company: 'Cheiron',
    sector: 'tech',
    kind: 'ashby',
    board: 'cheiron',
    boardUrl: 'https://jobs.ashbyhq.com/cheiron'
  },
  {
    company: 'Chicago Trading Company',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'chicagotradingcampus',
    boardUrl: 'https://job-boards.greenhouse.io/chicagotradingcampus'
  },
  {
    company: 'CIBC',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cibc.wd3.myworkdayjobs.com',
    tenant: 'cibc',
    site: 'search',
    boardUrl: 'https://cibc.wd3.myworkdayjobs.com/search?q=intern'
  },
  {
    company: 'Ciena',
    sector: 'tech',
    kind: 'workday',
    host: 'https://ciena.wd5.myworkdayjobs.com',
    tenant: 'ciena',
    site: 'Careers',
    boardUrl: 'https://ciena.wd5.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'Cigna',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cigna.wd5.myworkdayjobs.com',
    tenant: 'cigna',
    site: 'cignacareers',
    boardUrl: 'https://cigna.wd5.myworkdayjobs.com/cignacareers?q=intern'
  },
  {
    company: 'Circleback',
    sector: 'tech',
    kind: 'ashby',
    board: 'circleback',
    boardUrl: 'https://jobs.ashbyhq.com/circleback'
  },
  {
    company: 'Citadel',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.citadel.com/careers/open-opportunities/'
  },
  {
    company: 'Clarios',
    sector: 'tech',
    kind: 'workday',
    host: 'https://clarios.wd5.myworkdayjobs.com',
    tenant: 'clarios',
    site: 'clarioscareers',
    boardUrl: 'https://clarios.wd5.myworkdayjobs.com/clarioscareers?q=intern'
  },
  {
    company: 'Cluely',
    sector: 'tech',
    kind: 'ashby',
    board: 'cluely',
    boardUrl: 'https://jobs.ashbyhq.com/cluely'
  },
  {
    company: 'Codeage',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'Codeage',
    boardUrl: 'https://jobs.smartrecruiters.com/Codeage'
  },
  {
    company: 'Compeer Financial',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'compeerfinancial',
    boardUrl: 'https://job-boards.greenhouse.io/compeerfinancial'
  },
  {
    company: 'Composio',
    sector: 'tech',
    kind: 'ashby',
    board: 'composio',
    boardUrl: 'https://jobs.ashbyhq.com/composio'
  },
  {
    company: 'Conagra Brands',
    sector: 'tech',
    kind: 'workday',
    host: 'https://conagrabrands.wd1.myworkdayjobs.com',
    tenant: 'conagrabrands',
    site: 'Careers_US',
    boardUrl: 'https://conagrabrands.wd1.myworkdayjobs.com/Careers_US?q=intern'
  },
  {
    company: 'Contoro',
    sector: 'tech',
    kind: 'ashby',
    board: 'contoro',
    boardUrl: 'https://jobs.ashbyhq.com/contoro'
  },
  {
    company: 'Copart',
    sector: 'tech',
    kind: 'workday',
    host: 'https://copart.wd12.myworkdayjobs.com',
    tenant: 'copart',
    site: 'copart',
    boardUrl: 'https://copart.wd12.myworkdayjobs.com/copart?q=intern'
  },
  {
    company: 'Cox',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cox.wd1.myworkdayjobs.com',
    tenant: 'cox',
    site: 'Cox_External_Career_Site_1',
    boardUrl: 'https://cox.wd1.myworkdayjobs.com/Cox_External_Career_Site_1?q=intern'
  },
  {
    company: 'Crane Co.',
    sector: 'tech',
    kind: 'workday',
    host: 'https://cranecompany.wd5.myworkdayjobs.com',
    tenant: 'cranecompany',
    site: 'Careers',
    boardUrl: 'https://cranecompany.wd5.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'Crest Industries',
    sector: 'tech',
    kind: 'lever',
    board: 'crestoperations',
    boardUrl: 'https://jobs.lever.co/crestoperations'
  },
  {
    company: 'Cresta',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'cresta',
    boardUrl: 'https://job-boards.greenhouse.io/cresta'
  },
  {
    company: 'Crowe',
    sector: 'tech',
    kind: 'workday',
    host: 'https://crowe.wd12.myworkdayjobs.com',
    tenant: 'crowe',
    site: 'external_careers',
    boardUrl: 'https://crowe.wd12.myworkdayjobs.com/external_careers?q=intern'
  },
  {
    company: 'Danaher',
    sector: 'tech',
    kind: 'workday',
    host: 'https://danaher.wd1.myworkdayjobs.com',
    tenant: 'danaher',
    site: 'danaherjobs',
    boardUrl: 'https://danaher.wd1.myworkdayjobs.com/danaherjobs?q=intern'
  },
  {
    company: 'Dedalus Labs',
    sector: 'tech',
    kind: 'ashby',
    board: 'dedalus-labs',
    boardUrl: 'https://jobs.ashbyhq.com/dedalus-labs'
  },
  {
    company: 'Deepgram',
    sector: 'tech',
    kind: 'ashby',
    board: 'deepgram',
    boardUrl: 'https://jobs.ashbyhq.com/deepgram'
  },
  {
    company: 'Dev Technology Group',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'devtechnology',
    boardUrl: 'https://job-boards.greenhouse.io/devtechnology'
  },
  {
    company: 'DiDi Global',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'didi',
    boardUrl: 'https://job-boards.greenhouse.io/didi'
  },
  {
    company: 'Dimensional Fund Advisors',
    sector: 'tech',
    kind: 'workday',
    host: 'https://dimensional.wd5.myworkdayjobs.com',
    tenant: 'dimensional',
    site: 'dfa_careers',
    boardUrl: 'https://dimensional.wd5.myworkdayjobs.com/dfa_careers?q=intern'
  },
  {
    company: 'Diversified Automation',
    sector: 'auto',
    kind: 'lever',
    board: 'diversified-automation',
    boardUrl: 'https://jobs.lever.co/diversified-automation'
  },
  {
    company: 'Doordash',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'doordashusa',
    boardUrl: 'https://job-boards.greenhouse.io/doordashusa'
  },
  {
    company: 'Draper',
    sector: 'tech',
    kind: 'workday',
    host: 'https://draper.wd5.myworkdayjobs.com',
    tenant: 'draper',
    site: 'draper_careers',
    boardUrl: 'https://draper.wd5.myworkdayjobs.com/draper_careers?q=intern'
  },
  {
    company: 'DriveTime',
    sector: 'tech',
    kind: 'workday',
    host: 'https://drivetime.wd1.myworkdayjobs.com',
    tenant: 'drivetime',
    site: 'DriveTime',
    boardUrl: 'https://drivetime.wd1.myworkdayjobs.com/DriveTime?q=intern'
  },
  {
    company: 'Droyd Robotics',
    sector: 'tech',
    kind: 'ashby',
    board: 'droyd',
    boardUrl: 'https://jobs.ashbyhq.com/droyd'
  },
  {
    company: 'DRW',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'drweng',
    boardUrl: 'https://job-boards.greenhouse.io/drweng'
  },
  {
    company: 'DV Group',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'dvtrading',
    boardUrl: 'https://job-boards.greenhouse.io/dvtrading'
  },
  {
    company: 'Eight Sleep',
    sector: 'tech',
    kind: 'ashby',
    board: 'eightsleep',
    boardUrl: 'https://jobs.ashbyhq.com/eightsleep'
  },
  {
    company: 'Elanco',
    sector: 'tech',
    kind: 'workday',
    host: 'https://elanco.wd5.myworkdayjobs.com',
    tenant: 'elanco',
    site: 'External_Career',
    boardUrl: 'https://elanco.wd5.myworkdayjobs.com/External_Career?q=intern'
  },
  {
    company: 'Epia Neuro',
    sector: 'tech',
    kind: 'ashby',
    board: 'epianeuro',
    boardUrl: 'https://jobs.ashbyhq.com/epianeuro'
  },
  {
    company: 'Eragon',
    sector: 'tech',
    kind: 'ashby',
    board: 'eragon',
    boardUrl: 'https://jobs.ashbyhq.com/eragon'
  },
  {
    company: 'Etched',
    sector: 'tech',
    kind: 'ashby',
    board: 'Etched',
    boardUrl: 'https://jobs.ashbyhq.com/Etched'
  },
  {
    company: 'Eurofins',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'Eurofins',
    boardUrl: 'https://jobs.smartrecruiters.com/Eurofins'
  },
  {
    company: 'Exa',
    sector: 'tech',
    kind: 'ashby',
    board: 'exa',
    boardUrl: 'https://jobs.ashbyhq.com/exa'
  },
  {
    company: 'Fab2',
    sector: 'tech',
    kind: 'ashby',
    board: 'fab2',
    boardUrl: 'https://jobs.ashbyhq.com/fab2'
  },
  {
    company: 'Faraday Future',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'faradayfuture',
    boardUrl: 'https://job-boards.greenhouse.io/faradayfuture'
  },
  {
    company: 'Figure',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'figureai',
    boardUrl: 'https://job-boards.greenhouse.io/figureai'
  },
  {
    company: 'Firetiger',
    sector: 'tech',
    kind: 'ashby',
    board: 'firetiger',
    boardUrl: 'https://jobs.ashbyhq.com/firetiger'
  },
  {
    company: 'First Quality',
    sector: 'tech',
    kind: 'workday',
    host: 'https://firstquality.wd5.myworkdayjobs.com',
    tenant: 'firstquality',
    site: 'firstquality',
    boardUrl: 'https://firstquality.wd5.myworkdayjobs.com/firstquality?q=intern'
  },
  {
    company: 'Five Rings',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'fiveringsllc',
    boardUrl: 'https://job-boards.greenhouse.io/fiveringsllc'
  },
  {
    company: 'Flagship Pioneering',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'fspco-op012325',
    boardUrl: 'https://job-boards.greenhouse.io/fspco-op012325'
  },
  {
    company: 'Fluxergy',
    sector: 'tech',
    kind: 'lever',
    board: 'fluxergy-2',
    boardUrl: 'https://jobs.lever.co/fluxergy-2'
  },
  {
    company: 'Forus',
    sector: 'tech',
    kind: 'ashby',
    board: 'forus',
    boardUrl: 'https://jobs.ashbyhq.com/forus'
  },
  {
    company: 'Freeform',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'freeformfuturecorp',
    boardUrl: 'https://job-boards.greenhouse.io/freeformfuturecorp'
  },
  {
    company: 'Frontier Health',
    sector: 'healthcare',
    kind: 'ashby',
    board: 'frontier-health',
    boardUrl: 'https://jobs.ashbyhq.com/frontier-health'
  },
  {
    company: 'FTI Consulting',
    sector: 'consulting',
    kind: 'workday',
    host: 'https://fticonsulting.wd108.myworkdayjobs.com',
    tenant: 'fticonsulting',
    site: 'FTIConsultingCareers',
    boardUrl: 'https://fticonsulting.wd108.myworkdayjobs.com/FTIConsultingCareers?q=intern'
  },
  {
    company: 'Fundwell',
    sector: 'tech',
    kind: 'ashby',
    board: 'fundwell',
    boardUrl: 'https://jobs.ashbyhq.com/fundwell'
  },
  {
    company: 'Garner Health',
    sector: 'healthcare',
    kind: 'greenhouse',
    board: 'garnerhealth',
    boardUrl: 'https://job-boards.greenhouse.io/garnerhealth'
  },
  {
    company: 'GE Aerospace',
    sector: 'aerospace',
    kind: 'workday',
    host: 'https://geaerospace.wd5.myworkdayjobs.com',
    tenant: 'geaerospace',
    site: 'ge_externalsite',
    boardUrl: 'https://geaerospace.wd5.myworkdayjobs.com/ge_externalsite?q=intern'
  },
  {
    company: 'GE Appliances',
    sector: 'tech',
    kind: 'workday',
    host: 'https://haier.wd3.myworkdayjobs.com',
    tenant: 'haier',
    site: 'ge_appliances',
    boardUrl: 'https://haier.wd3.myworkdayjobs.com/ge_appliances?q=intern'
  },
  {
    company: 'GE Healthcare',
    sector: 'healthcare',
    kind: 'workday',
    host: 'https://gehc.wd5.myworkdayjobs.com',
    tenant: 'gehc',
    site: 'GEHC_ExternalSite',
    boardUrl: 'https://gehc.wd5.myworkdayjobs.com/GEHC_ExternalSite?q=intern'
  },
  {
    company: 'GE Vernova',
    sector: 'tech',
    kind: 'workday',
    host: 'https://gevernova.wd5.myworkdayjobs.com',
    tenant: 'gevernova',
    site: 'only_confidential_executive_recruiting',
    boardUrl: 'https://gevernova.wd5.myworkdayjobs.com/only_confidential_executive_recruiting?q=intern'
  },
  {
    company: 'Genentech',
    sector: 'tech',
    kind: 'workday',
    host: 'https://roche.wd3.myworkdayjobs.com',
    tenant: 'roche',
    site: 'ROG-A2O-GENE',
    boardUrl: 'https://roche.wd3.myworkdayjobs.com/ROG-A2O-GENE?q=intern'
  },
  {
    company: 'General Dynamics UK',
    sector: 'aerospace',
    kind: 'smartrecruiters',
    board: 'GDMSI',
    boardUrl: 'https://jobs.smartrecruiters.com/GDMSI'
  },
  {
    company: 'General Matter',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'generalmatter',
    boardUrl: 'https://job-boards.greenhouse.io/generalmatter'
  },
  {
    company: 'GenScript',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'genscript',
    boardUrl: 'https://job-boards.greenhouse.io/genscript'
  },
  {
    company: 'GlobalFoundries',
    sector: 'tech',
    kind: 'workday',
    host: 'https://globalfoundries.wd1.myworkdayjobs.com',
    tenant: 'globalfoundries',
    site: 'External',
    boardUrl: 'https://globalfoundries.wd1.myworkdayjobs.com/External?q=intern'
  },
  {
    company: 'Greenheck Group',
    sector: 'tech',
    kind: 'workday',
    host: 'https://greenheckgroup.wd5.myworkdayjobs.com',
    tenant: 'greenheckgroup',
    site: 'external',
    boardUrl: 'https://greenheckgroup.wd5.myworkdayjobs.com/external?q=intern'
  },
  {
    company: 'Gritt',
    sector: 'tech',
    kind: 'ashby',
    board: 'gritt',
    boardUrl: 'https://jobs.ashbyhq.com/gritt'
  },
  {
    company: 'Gumloop',
    sector: 'tech',
    kind: 'ashby',
    board: 'Gumloop',
    boardUrl: 'https://jobs.ashbyhq.com/Gumloop'
  },
  {
    company: 'H3X Technologies',
    sector: 'tech',
    kind: 'ashby',
    board: 'h3x-technologies',
    boardUrl: 'https://jobs.ashbyhq.com/h3x-technologies'
  },
  {
    company: 'HARMAN International',
    sector: 'tech',
    kind: 'workday',
    host: 'https://harman.wd3.myworkdayjobs.com',
    tenant: 'harman',
    site: 'HARMAN',
    boardUrl: 'https://harman.wd3.myworkdayjobs.com/HARMAN?q=intern'
  },
  {
    company: 'Heliux',
    sector: 'tech',
    kind: 'ashby',
    board: 'heliux',
    boardUrl: 'https://jobs.ashbyhq.com/heliux'
  },
  {
    company: 'Hendrick Motorsports',
    sector: 'auto',
    kind: 'workday',
    host: 'https://hendrick.wd5.myworkdayjobs.com',
    tenant: 'hendrick',
    site: 'HMSCareers',
    boardUrl: 'https://hendrick.wd5.myworkdayjobs.com/HMSCareers?q=intern'
  },
  {
    company: 'Hermeus',
    sector: 'tech',
    kind: 'lever',
    board: 'hermeus',
    boardUrl: 'https://jobs.lever.co/hermeus'
  },
  {
    company: 'Heron Power',
    sector: 'tech',
    kind: 'ashby',
    board: 'heron-power',
    boardUrl: 'https://jobs.ashbyhq.com/heron-power'
  },
  {
    company: 'Hewlett Packard (HP)',
    sector: 'tech',
    kind: 'workday',
    host: 'https://hp.wd5.myworkdayjobs.com',
    tenant: 'hp',
    site: 'EXTEU-AC-CareerSite',
    boardUrl: 'https://hp.wd5.myworkdayjobs.com/EXTEU-AC-CareerSite?q=intern'
  },
  {
    company: 'Hitachi',
    sector: 'tech',
    kind: 'workday',
    host: 'https://hitachi.wd1.myworkdayjobs.com',
    tenant: 'hitachi',
    site: 'hitachi',
    boardUrl: 'https://hitachi.wd1.myworkdayjobs.com/hitachi?q=intern'
  },
  {
    company: 'Hiverge',
    sector: 'tech',
    kind: 'ashby',
    board: 'hiverge',
    boardUrl: 'https://jobs.ashbyhq.com/hiverge'
  },
  {
    company: 'HNTB',
    sector: 'tech',
    kind: 'workday',
    host: 'https://hntb.wd5.myworkdayjobs.com',
    tenant: 'hntb',
    site: 'hntb_careers',
    boardUrl: 'https://hntb.wd5.myworkdayjobs.com/hntb_careers?q=intern'
  },
  {
    company: 'Home Depot',
    sector: 'consumer',
    kind: 'workday',
    host: 'https://homedepot.wd5.myworkdayjobs.com',
    tenant: 'homedepot',
    site: 'CareerDepot',
    boardUrl: 'https://homedepot.wd5.myworkdayjobs.com/CareerDepot?q=intern'
  },
  {
    company: 'Honeywell',
    sector: 'aerospace',
    kind: 'link',
    boardUrl: 'https://honeywell.wd1.myworkdayjobs.com/External_Career_Site?q=intern'
  },
  {
    company: 'HP Inc',
    sector: 'tech',
    kind: 'workday',
    host: 'https://hp.wd5.myworkdayjobs.com',
    tenant: 'hp',
    site: 'externalcareersite',
    boardUrl: 'https://hp.wd5.myworkdayjobs.com/externalcareersite?q=intern'
  },
  {
    company: 'HP IQ',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'hpiq',
    boardUrl: 'https://job-boards.greenhouse.io/hpiq'
  },
  {
    company: 'HPE (University)',
    sector: 'tech',
    kind: 'workday',
    host: 'https://hpe.wd5.myworkdayjobs.com',
    tenant: 'hpe',
    site: 'Jobsathpe',
    boardUrl: 'https://hpe.wd5.myworkdayjobs.com/Jobsathpe?q=intern'
  },
  {
    company: 'HPR',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'hyannisportresearch',
    boardUrl: 'https://job-boards.greenhouse.io/hyannisportresearch'
  },
  {
    company: 'Hudson River Trading',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.hudsonrivertrading.com/careers/'
  },
  {
    company: 'Human Computer Lab',
    sector: 'tech',
    kind: 'ashby',
    board: 'human-computer-lab',
    boardUrl: 'https://jobs.ashbyhq.com/human-computer-lab'
  },
  {
    company: 'Humana',
    sector: 'tech',
    kind: 'workday',
    host: 'https://humana.wd5.myworkdayjobs.com',
    tenant: 'humana',
    site: 'Humana_External_Career_Site',
    boardUrl: 'https://humana.wd5.myworkdayjobs.com/Humana_External_Career_Site?q=intern'
  },
  {
    company: 'IMC Trading',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'imc',
    boardUrl: 'https://job-boards.greenhouse.io/imc'
  },
  {
    company: 'Institute for Foundation Models',
    sector: 'tech',
    kind: 'lever',
    board: 'ifm-us',
    boardUrl: 'https://jobs.lever.co/ifm-us'
  },
  {
    company: 'Integra FEC',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'integra',
    boardUrl: 'https://job-boards.greenhouse.io/integra'
  },
  {
    company: 'Intuitive',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'Intuitive',
    boardUrl: 'https://jobs.smartrecruiters.com/Intuitive'
  },
  {
    company: 'Jane Street',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.janestreet.com/join-jane-street/internships/'
  },
  {
    company: 'JLL',
    sector: 'tech',
    kind: 'workday',
    host: 'https://jll.wd1.myworkdayjobs.com',
    tenant: 'jll',
    site: 'jllcareers',
    boardUrl: 'https://jll.wd1.myworkdayjobs.com/jllcareers?q=intern'
  },
  {
    company: 'Johnson Controls',
    sector: 'tech',
    kind: 'workday',
    host: 'https://jci.wd5.myworkdayjobs.com',
    tenant: 'jci',
    site: 'JCI',
    boardUrl: 'https://jci.wd5.myworkdayjobs.com/JCI?q=intern'
  },
  {
    company: 'Jump Trading',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://www.jumptrading.com/careers/'
  },
  {
    company: 'k-ID',
    sector: 'tech',
    kind: 'ashby',
    board: 'k-id',
    boardUrl: 'https://jobs.ashbyhq.com/k-id'
  },
  {
    company: 'K2 Space',
    sector: 'aerospace',
    kind: 'greenhouse',
    board: 'k2spacecorporation',
    boardUrl: 'https://job-boards.greenhouse.io/k2spacecorporation'
  },
  {
    company: 'Kastle',
    sector: 'tech',
    kind: 'ashby',
    board: 'kastle',
    boardUrl: 'https://jobs.ashbyhq.com/kastle'
  },
  {
    company: 'Kepler Communications',
    sector: 'tech',
    kind: 'lever',
    board: 'kepler',
    boardUrl: 'https://jobs.lever.co/kepler'
  },
  {
    company: 'KeyBank',
    sector: 'finance',
    kind: 'workday',
    host: 'https://keybank.wd5.myworkdayjobs.com',
    tenant: 'keybank',
    site: 'External_Career_Site',
    boardUrl: 'https://keybank.wd5.myworkdayjobs.com/External_Career_Site?q=intern'
  },
  {
    company: 'KION Group',
    sector: 'tech',
    kind: 'workday',
    host: 'https://kiongroup.wd3.myworkdayjobs.com',
    tenant: 'kiongroup',
    site: 'kiongroup',
    boardUrl: 'https://kiongroup.wd3.myworkdayjobs.com/kiongroup?q=intern'
  },
  {
    company: 'Kodiak Robotics',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'kodiak',
    boardUrl: 'https://job-boards.greenhouse.io/kodiak'
  },
  {
    company: 'Kognitos',
    sector: 'tech',
    kind: 'ashby',
    board: 'kognitos',
    boardUrl: 'https://jobs.ashbyhq.com/kognitos'
  },
  {
    company: 'kos.ai',
    sector: 'tech',
    kind: 'ashby',
    board: 'kos.ai',
    boardUrl: 'https://jobs.ashbyhq.com/kos.ai'
  },
  {
    company: 'KOSTAL Group',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'KOSTALGroup',
    boardUrl: 'https://jobs.smartrecruiters.com/KOSTALGroup'
  },
  {
    company: 'Lambda',
    sector: 'tech',
    kind: 'ashby',
    board: 'lambda',
    boardUrl: 'https://jobs.ashbyhq.com/lambda'
  },
  {
    company: 'Later',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'later',
    boardUrl: 'https://job-boards.greenhouse.io/later'
  },
  {
    company: 'Layup Parts',
    sector: 'tech',
    kind: 'lever',
    board: 'layup',
    boardUrl: 'https://jobs.lever.co/layup'
  },
  {
    company: 'Leidos',
    sector: 'aerospace',
    kind: 'workday',
    host: 'https://leidos.wd5.myworkdayjobs.com',
    tenant: 'leidos',
    site: 'External',
    boardUrl: 'https://leidos.wd5.myworkdayjobs.com/External?q=intern'
  },
  {
    company: 'Leland',
    sector: 'tech',
    kind: 'ashby',
    board: 'leland',
    boardUrl: 'https://jobs.ashbyhq.com/leland'
  },
  {
    company: 'Life.Church (YouVersion)',
    sector: 'tech',
    kind: 'lever',
    board: 'life',
    boardUrl: 'https://jobs.lever.co/life'
  },
  {
    company: 'LLNL',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'llnl',
    boardUrl: 'https://jobs.smartrecruiters.com/llnl'
  },
  {
    company: 'LPL Financial',
    sector: 'finance',
    kind: 'workday',
    host: 'https://lplfinancial.wd1.myworkdayjobs.com',
    tenant: 'lplfinancial',
    site: 'university',
    boardUrl: 'https://lplfinancial.wd1.myworkdayjobs.com/university?q=intern'
  },
  {
    company: 'Lumentum',
    sector: 'tech',
    kind: 'workday',
    host: 'https://lumentum.wd5.myworkdayjobs.com',
    tenant: 'lumentum',
    site: 'LITE',
    boardUrl: 'https://lumentum.wd5.myworkdayjobs.com/LITE?q=intern'
  },
  {
    company: 'Lunar Energy',
    sector: 'energy',
    kind: 'greenhouse',
    board: 'lunarenergy',
    boardUrl: 'https://job-boards.greenhouse.io/lunarenergy'
  },
  {
    company: 'Machina Labs',
    sector: 'tech',
    kind: 'lever',
    board: 'MachinaLabs',
    boardUrl: 'https://jobs.lever.co/MachinaLabs'
  },
  {
    company: 'Manulife',
    sector: 'tech',
    kind: 'workday',
    host: 'https://manulife.wd3.myworkdayjobs.com',
    tenant: 'manulife',
    site: 'MFCJH_Jobs',
    boardUrl: 'https://manulife.wd3.myworkdayjobs.com/MFCJH_Jobs?q=intern'
  },
  {
    company: 'Marvell',
    sector: 'tech',
    kind: 'workday',
    host: 'https://marvell.wd1.myworkdayjobs.com',
    tenant: 'marvell',
    site: 'MarvellCareers',
    boardUrl: 'https://marvell.wd1.myworkdayjobs.com/MarvellCareers?q=intern'
  },
  {
    company: 'MatX',
    sector: 'tech',
    kind: 'ashby',
    board: 'matx',
    boardUrl: 'https://jobs.ashbyhq.com/matx'
  },
  {
    company: 'Mechanize',
    sector: 'tech',
    kind: 'ashby',
    board: 'mechanize',
    boardUrl: 'https://jobs.ashbyhq.com/mechanize'
  },
  {
    company: 'Medtronic',
    sector: 'tech',
    kind: 'workday',
    host: 'https://medtronic.wd1.myworkdayjobs.com',
    tenant: 'medtronic',
    site: 'medtroniccareers',
    boardUrl: 'https://medtronic.wd1.myworkdayjobs.com/medtroniccareers?q=intern'
  },
  {
    company: 'Melius',
    sector: 'tech',
    kind: 'ashby',
    board: 'melius',
    boardUrl: 'https://jobs.ashbyhq.com/melius'
  },
  {
    company: 'Menasha Corporation',
    sector: 'tech',
    kind: 'workday',
    host: 'https://menasha.wd12.myworkdayjobs.com',
    tenant: 'menasha',
    site: 'menashacorp',
    boardUrl: 'https://menasha.wd12.myworkdayjobs.com/menashacorp?q=intern'
  },
  {
    company: 'Meridian Partners',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'morsecorpcoop',
    boardUrl: 'https://job-boards.greenhouse.io/morsecorpcoop'
  },
  {
    company: 'Microchip Technology',
    sector: 'tech',
    kind: 'workday',
    host: 'https://microchiphr.wd5.myworkdayjobs.com',
    tenant: 'microchiphr',
    site: 'External',
    boardUrl: 'https://microchiphr.wd5.myworkdayjobs.com/External?q=intern'
  },
  {
    company: 'Mistral AI',
    sector: 'tech',
    kind: 'ashby',
    board: 'mistral.ai',
    boardUrl: 'https://jobs.ashbyhq.com/mistral.ai'
  },
  {
    company: 'MKS Instruments',
    sector: 'tech',
    kind: 'workday',
    host: 'https://mksinst.wd1.myworkdayjobs.com',
    tenant: 'mksinst',
    site: 'MKSCareersUniversity',
    boardUrl: 'https://mksinst.wd1.myworkdayjobs.com/MKSCareersUniversity?q=intern'
  },
  {
    company: 'Modal',
    sector: 'tech',
    kind: 'ashby',
    board: 'modal',
    boardUrl: 'https://jobs.ashbyhq.com/modal'
  },
  {
    company: 'Momentive',
    sector: 'tech',
    kind: 'workday',
    host: 'https://momentive.wd1.myworkdayjobs.com',
    tenant: 'momentive',
    site: 'MC',
    boardUrl: 'https://momentive.wd1.myworkdayjobs.com/MC?q=intern'
  },
  {
    company: 'Monolithic Power Systems, Inc.',
    sector: 'tech',
    kind: 'workday',
    host: 'https://monolithicpower.wd12.myworkdayjobs.com',
    tenant: 'monolithicpower',
    site: 'MPS_Careers',
    boardUrl: 'https://monolithicpower.wd12.myworkdayjobs.com/MPS_Careers?q=intern'
  },
  {
    company: 'Moog',
    sector: 'tech',
    kind: 'workday',
    host: 'https://moog.wd5.myworkdayjobs.com',
    tenant: 'moog',
    site: 'moog_external_career_site',
    boardUrl: 'https://moog.wd5.myworkdayjobs.com/moog_external_career_site?q=intern'
  },
  {
    company: 'Motorola Solutions',
    sector: 'auto',
    kind: 'workday',
    host: 'https://motorolasolutions.wd5.myworkdayjobs.com',
    tenant: 'motorolasolutions',
    site: 'Careers',
    boardUrl: 'https://motorolasolutions.wd5.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'N1',
    sector: 'tech',
    kind: 'ashby',
    board: 'N1',
    boardUrl: 'https://jobs.ashbyhq.com/N1'
  },
  {
    company: 'National Interstate Insurance',
    sector: 'tech',
    kind: 'workday',
    host: 'https://gaig.wd1.myworkdayjobs.com',
    tenant: 'gaig',
    site: 'GAIG_External',
    boardUrl: 'https://gaig.wd1.myworkdayjobs.com/GAIG_External?q=intern'
  },
  {
    company: 'Nationwide',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nationwide.wd1.myworkdayjobs.com',
    tenant: 'nationwide',
    site: 'Nationwide_Career',
    boardUrl: 'https://nationwide.wd1.myworkdayjobs.com/Nationwide_Career?q=intern'
  },
  {
    company: 'NBCUniversal',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'NBCUniversal3',
    boardUrl: 'https://jobs.smartrecruiters.com/NBCUniversal3'
  },
  {
    company: 'Nelnet',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nelnet.wd1.myworkdayjobs.com',
    tenant: 'nelnet',
    site: 'MyNelnet',
    boardUrl: 'https://nelnet.wd1.myworkdayjobs.com/MyNelnet?q=intern'
  },
  {
    company: 'Netic',
    sector: 'tech',
    kind: 'ashby',
    board: 'netic',
    boardUrl: 'https://jobs.ashbyhq.com/netic'
  },
  {
    company: 'Neuralink',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'neuralink',
    boardUrl: 'https://job-boards.greenhouse.io/neuralink'
  },
  {
    company: 'Niantic Spatial',
    sector: 'tech',
    kind: 'ashby',
    board: 'niantic-spatial',
    boardUrl: 'https://jobs.ashbyhq.com/niantic-spatial'
  },
  {
    company: 'Nidec',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nidec.wd1.myworkdayjobs.com',
    tenant: 'nidec',
    site: 'nidec',
    boardUrl: 'https://nidec.wd1.myworkdayjobs.com/nidec?q=intern'
  },
  {
    company: 'Nightwing',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nwis.wd12.myworkdayjobs.com',
    tenant: 'nwis',
    site: 'NW',
    boardUrl: 'https://nwis.wd12.myworkdayjobs.com/NW?q=intern'
  },
  {
    company: 'Nio',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nio.wd3.myworkdayjobs.com',
    tenant: 'nio',
    site: 'NIO_Careers',
    boardUrl: 'https://nio.wd3.myworkdayjobs.com/NIO_Careers?q=intern'
  },
  {
    company: 'Nissan Global',
    sector: 'tech',
    kind: 'workday',
    host: 'https://alliance.wd3.myworkdayjobs.com',
    tenant: 'alliance',
    site: 'nissanjobs',
    boardUrl: 'https://alliance.wd3.myworkdayjobs.com/nissanjobs?q=intern'
  },
  {
    company: 'Nomagic',
    sector: 'tech',
    kind: 'lever',
    board: 'Nomagic',
    boardUrl: 'https://jobs.lever.co/Nomagic'
  },
  {
    company: 'Northwestern Mutual',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'NorthwesternMutual',
    boardUrl: 'https://jobs.smartrecruiters.com/NorthwesternMutual'
  },
  {
    company: 'Northwood Space',
    sector: 'aerospace',
    kind: 'ashby',
    board: 'NorthwoodSpace',
    boardUrl: 'https://jobs.ashbyhq.com/NorthwoodSpace'
  },
  {
    company: 'Novanta',
    sector: 'tech',
    kind: 'workday',
    host: 'https://novanta.wd5.myworkdayjobs.com',
    tenant: 'novanta',
    site: 'Novanta-Careers',
    boardUrl: 'https://novanta.wd5.myworkdayjobs.com/Novanta-Careers?q=intern'
  },
  {
    company: 'NXP Semiconductors',
    sector: 'tech',
    kind: 'workday',
    host: 'https://nxp.wd3.myworkdayjobs.com',
    tenant: 'nxp',
    site: 'careers',
    boardUrl: 'https://nxp.wd3.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Odin Dynamics',
    sector: 'aerospace',
    kind: 'ashby',
    board: 'odin-dynamics',
    boardUrl: 'https://jobs.ashbyhq.com/odin-dynamics'
  },
  {
    company: 'Odys Aviation',
    sector: 'tech',
    kind: 'ashby',
    board: 'odys-aviation',
    boardUrl: 'https://jobs.ashbyhq.com/odys-aviation'
  },
  {
    company: 'Olsson',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'olsson',
    boardUrl: 'https://job-boards.greenhouse.io/olsson'
  },
  {
    company: 'Omnicom Group',
    sector: 'tech',
    kind: 'workday',
    host: 'https://interpublic.wd5.myworkdayjobs.com',
    tenant: 'interpublic',
    site: 'omc',
    boardUrl: 'https://interpublic.wd5.myworkdayjobs.com/omc?q=intern'
  },
  {
    company: 'ONEOK',
    sector: 'tech',
    kind: 'workday',
    host: 'https://oneok.wd1.myworkdayjobs.com',
    tenant: 'oneok',
    site: 'ONEOK_Early_Careers',
    boardUrl: 'https://oneok.wd1.myworkdayjobs.com/ONEOK_Early_Careers?q=intern'
  },
  {
    company: 'Ontario Teachers\' Pension Plan',
    sector: 'tech',
    kind: 'workday',
    host: 'https://otppb.wd3.myworkdayjobs.com',
    tenant: 'otppb',
    site: 'OntarioTeachers_Careers',
    boardUrl: 'https://otppb.wd3.myworkdayjobs.com/OntarioTeachers_Careers?q=intern'
  },
  {
    company: 'Optiver',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://optiver.com/working-at-optiver/career-opportunities/'
  },
  {
    company: 'Oshkosh Corporation',
    sector: 'tech',
    kind: 'workday',
    host: 'https://oshkoshcorporation.wd5.myworkdayjobs.com',
    tenant: 'oshkoshcorporation',
    site: 'Oshkosh',
    boardUrl: 'https://oshkoshcorporation.wd5.myworkdayjobs.com/Oshkosh?q=intern'
  },
  {
    company: 'Parsons',
    sector: 'tech',
    kind: 'workday',
    host: 'https://parsons.wd5.myworkdayjobs.com',
    tenant: 'parsons',
    site: 'search',
    boardUrl: 'https://parsons.wd5.myworkdayjobs.com/search?q=intern'
  },
  {
    company: 'PDT Partners',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'pdtpartners',
    boardUrl: 'https://job-boards.greenhouse.io/pdtpartners'
  },
  {
    company: 'Pennsylvania State University',
    sector: 'tech',
    kind: 'workday',
    host: 'https://psu.wd1.myworkdayjobs.com',
    tenant: 'psu',
    site: 'PSU_Staff',
    boardUrl: 'https://psu.wd1.myworkdayjobs.com/PSU_Staff?q=intern'
  },
  {
    company: 'Periodic Labs',
    sector: 'tech',
    kind: 'ashby',
    board: 'periodic-labs',
    boardUrl: 'https://jobs.ashbyhq.com/periodic-labs'
  },
  {
    company: 'Persona AI',
    sector: 'tech',
    kind: 'ashby',
    board: 'persona.ai',
    boardUrl: 'https://jobs.ashbyhq.com/persona.ai'
  },
  {
    company: 'Philips',
    sector: 'tech',
    kind: 'workday',
    host: 'https://philips.wd3.myworkdayjobs.com',
    tenant: 'philips',
    site: 'jobs-and-careers',
    boardUrl: 'https://philips.wd3.myworkdayjobs.com/jobs-and-careers?q=intern'
  },
  {
    company: 'Phonely',
    sector: 'tech',
    kind: 'ashby',
    board: 'phonely',
    boardUrl: 'https://jobs.ashbyhq.com/phonely'
  },
  {
    company: 'PIMCO',
    sector: 'tech',
    kind: 'workday',
    host: 'https://pimco.wd1.myworkdayjobs.com',
    tenant: 'pimco',
    site: 'pimco-careers',
    boardUrl: 'https://pimco.wd1.myworkdayjobs.com/pimco-careers?q=intern'
  },
  {
    company: 'Pivotal Software',
    sector: 'tech',
    kind: 'lever',
    board: 'pivotal',
    boardUrl: 'https://jobs.lever.co/pivotal'
  },
  {
    company: 'Premier',
    sector: 'tech',
    kind: 'workday',
    host: 'https://premierinc.wd1.myworkdayjobs.com',
    tenant: 'premierinc',
    site: 'external_professional',
    boardUrl: 'https://premierinc.wd1.myworkdayjobs.com/external_professional?q=intern'
  },
  {
    company: 'Procter & Gamble',
    sector: 'tech',
    kind: 'workday',
    host: 'https://pg.wd5.myworkdayjobs.com',
    tenant: 'pg',
    site: '1000',
    boardUrl: 'https://pg.wd5.myworkdayjobs.com/1000?q=intern'
  },
  {
    company: 'Quadrillion Labs',
    sector: 'tech',
    kind: 'ashby',
    board: 'quadrillion-labs',
    boardUrl: 'https://jobs.ashbyhq.com/quadrillion-labs'
  },
  {
    company: 'Qualcomm',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://qualcomm.wd5.myworkdayjobs.com/External?q=intern'
  },
  {
    company: 'Radiance Technologies',
    sector: 'tech',
    kind: 'workday',
    host: 'https://radiancetech.wd12.myworkdayjobs.com',
    tenant: 'radiancetech',
    site: 'Radiance_External',
    boardUrl: 'https://radiancetech.wd12.myworkdayjobs.com/Radiance_External?q=intern'
  },
  {
    company: 'Radix Trading',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'radixuniversity',
    boardUrl: 'https://job-boards.greenhouse.io/radixuniversity'
  },
  {
    company: 'RapDev',
    sector: 'tech',
    kind: 'ashby',
    board: 'rapdev',
    boardUrl: 'https://jobs.ashbyhq.com/rapdev'
  },
  {
    company: 'RE/SPEC Inc.',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'RESPECInc',
    boardUrl: 'https://jobs.smartrecruiters.com/RESPECInc'
  },
  {
    company: 'Red Bull',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'RedBull',
    boardUrl: 'https://jobs.smartrecruiters.com/RedBull'
  },
  {
    company: 'Reflect Orbital',
    sector: 'tech',
    kind: 'ashby',
    board: 'reflect-orbital',
    boardUrl: 'https://jobs.ashbyhq.com/reflect-orbital'
  },
  {
    company: 'Reframe Systems',
    sector: 'tech',
    kind: 'ashby',
    board: 'reframesystems',
    boardUrl: 'https://jobs.ashbyhq.com/reframesystems'
  },
  {
    company: 'Regal Rexnord',
    sector: 'tech',
    kind: 'workday',
    host: 'https://regalrexnord.wd1.myworkdayjobs.com',
    tenant: 'regalrexnord',
    site: 'careers',
    boardUrl: 'https://regalrexnord.wd1.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Rendezvous Robotics',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'rendezvousrobotics',
    boardUrl: 'https://job-boards.greenhouse.io/rendezvousrobotics'
  },
  {
    company: 'Repsol',
    sector: 'tech',
    kind: 'workday',
    host: 'https://repsol.wd3.myworkdayjobs.com',
    tenant: 'repsol',
    site: 'Repsol',
    boardUrl: 'https://repsol.wd3.myworkdayjobs.com/Repsol?q=intern'
  },
  {
    company: 'Rilla',
    sector: 'tech',
    kind: 'ashby',
    board: 'rilla',
    boardUrl: 'https://jobs.ashbyhq.com/rilla'
  },
  {
    company: 'Roam',
    sector: 'tech',
    kind: 'ashby',
    board: 'tryroam',
    boardUrl: 'https://jobs.ashbyhq.com/tryroam'
  },
  {
    company: 'RoboForce',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'roboforce',
    boardUrl: 'https://job-boards.greenhouse.io/roboforce'
  },
  {
    company: 'RTX',
    sector: 'aerospace',
    kind: 'workday',
    host: 'https://globalhr.wd5.myworkdayjobs.com',
    tenant: 'globalhr',
    site: 'rec_rtx_ext_gateway',
    boardUrl: 'https://globalhr.wd5.myworkdayjobs.com/rec_rtx_ext_gateway?q=intern'
  },
  {
    company: 'Schonfeld',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'schonfeld',
    boardUrl: 'https://job-boards.greenhouse.io/schonfeld'
  },
  {
    company: 'Schweitzer Engineering Laboratories',
    sector: 'tech',
    kind: 'workday',
    host: 'https://selinc.wd1.myworkdayjobs.com',
    tenant: 'selinc',
    site: 'SEL',
    boardUrl: 'https://selinc.wd1.myworkdayjobs.com/SEL?q=intern'
  },
  {
    company: 'Sensata',
    sector: 'tech',
    kind: 'workday',
    host: 'https://sensata.wd1.myworkdayjobs.com',
    tenant: 'sensata',
    site: 'Sensata-Careers',
    boardUrl: 'https://sensata.wd1.myworkdayjobs.com/Sensata-Careers?q=intern'
  },
  {
    company: 'ServiceNow',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'ServiceNow',
    boardUrl: 'https://jobs.smartrecruiters.com/ServiceNow'
  },
  {
    company: 'Shield AI',
    sector: 'tech',
    kind: 'lever',
    board: 'shieldai',
    boardUrl: 'https://jobs.lever.co/shieldai'
  },
  {
    company: 'Shopify',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://job-boards.greenhouse.io/shopify'
  },
  {
    company: 'ShyftLabs',
    sector: 'tech',
    kind: 'lever',
    board: 'shyftlabs',
    boardUrl: 'https://jobs.lever.co/shyftlabs'
  },
  {
    company: 'Sierra Nevada Corporation',
    sector: 'tech',
    kind: 'workday',
    host: 'https://snc.wd1.myworkdayjobs.com',
    tenant: 'snc',
    site: 'snc_external_career_site',
    boardUrl: 'https://snc.wd1.myworkdayjobs.com/snc_external_career_site?q=intern'
  },
  {
    company: 'SiFive',
    sector: 'tech',
    kind: 'workday',
    host: 'https://sifive.wd1.myworkdayjobs.com',
    tenant: 'sifive',
    site: 'sifivecareers',
    boardUrl: 'https://sifive.wd1.myworkdayjobs.com/sifivecareers?q=intern'
  },
  {
    company: 'SK Hynix Memory Solution',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'skhynixmemorysolutionsamericainc',
    boardUrl: 'https://job-boards.greenhouse.io/skhynixmemorysolutionsamericainc'
  },
  {
    company: 'Skydio',
    sector: 'tech',
    kind: 'ashby',
    board: 'skydio',
    boardUrl: 'https://jobs.ashbyhq.com/skydio'
  },
  {
    company: 'Smiths Group',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'SmithsGroup2',
    boardUrl: 'https://jobs.smartrecruiters.com/SmithsGroup2'
  },
  {
    company: 'Snap',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://careers.snap.com/jobs?keyword=intern'
  },
  {
    company: 'Snowflake',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://job-boards.greenhouse.io/snowflakecomputing'
  },
  {
    company: 'Solidigm',
    sector: 'auto',
    kind: 'smartrecruiters',
    board: 'Solidigm',
    boardUrl: 'https://jobs.smartrecruiters.com/Solidigm'
  },
  {
    company: 'SoloPulse',
    sector: 'tech',
    kind: 'lever',
    board: 'solopulseco',
    boardUrl: 'https://jobs.lever.co/solopulseco'
  },
  {
    company: 'SpaceX',
    sector: 'aerospace',
    kind: 'greenhouse',
    board: 'spacex',
    boardUrl: 'https://job-boards.greenhouse.io/spacex'
  },
  {
    company: 'Square',
    sector: 'finance',
    kind: 'link',
    boardUrl: 'https://job-boards.greenhouse.io/square'
  },
  {
    company: 'Stanley Black & Decker',
    sector: 'consulting',
    kind: 'workday',
    host: 'https://sbdinc.wd1.myworkdayjobs.com',
    tenant: 'sbdinc',
    site: 'Stanley_Black_Decker_Career_Site',
    boardUrl: 'https://sbdinc.wd1.myworkdayjobs.com/Stanley_Black_Decker_Career_Site?q=intern'
  },
  {
    company: 'Stevens Capital Management',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'scm',
    boardUrl: 'https://job-boards.greenhouse.io/scm'
  },
  {
    company: 'T. Rowe Price',
    sector: 'tech',
    kind: 'workday',
    host: 'https://troweprice.wd5.myworkdayjobs.com',
    tenant: 'troweprice',
    site: 'TRowePrice',
    boardUrl: 'https://troweprice.wd5.myworkdayjobs.com/TRowePrice?q=intern'
  },
  {
    company: 'Teledyne',
    sector: 'tech',
    kind: 'workday',
    host: 'https://flir.wd1.myworkdayjobs.com',
    tenant: 'flir',
    site: 'flircareers',
    boardUrl: 'https://flir.wd1.myworkdayjobs.com/flircareers?q=intern'
  },
  {
    company: 'Tencent',
    sector: 'tech',
    kind: 'workday',
    host: 'https://tencent.wd1.myworkdayjobs.com',
    tenant: 'tencent',
    site: 'Tencent_Careers',
    boardUrl: 'https://tencent.wd1.myworkdayjobs.com/Tencent_Careers?q=intern'
  },
  {
    company: 'Tenstorrent',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'tenstorrentuniversity',
    boardUrl: 'https://job-boards.greenhouse.io/tenstorrentuniversity'
  },
  {
    company: 'Terranova',
    sector: 'tech',
    kind: 'ashby',
    board: 'terranova',
    boardUrl: 'https://jobs.ashbyhq.com/terranova'
  },
  {
    company: 'Tessera Labs',
    sector: 'tech',
    kind: 'ashby',
    board: 'tessera-labs',
    boardUrl: 'https://jobs.ashbyhq.com/tessera-labs'
  },
  {
    company: 'Texas Instruments',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://ti.wd1.myworkdayjobs.com/SearchTI?q=intern'
  },
  {
    company: 'The Exploration Company',
    sector: 'tech',
    kind: 'ashby',
    board: 'the-exploration-company',
    boardUrl: 'https://jobs.ashbyhq.com/the-exploration-company'
  },
  {
    company: 'The Nuclear Company',
    sector: 'energy',
    kind: 'greenhouse',
    board: 'thenuclearcompany',
    boardUrl: 'https://job-boards.greenhouse.io/thenuclearcompany'
  },
  {
    company: 'The Walt Disney Company',
    sector: 'consulting',
    kind: 'workday',
    host: 'https://disney.wd5.myworkdayjobs.com',
    tenant: 'disney',
    site: 'disneycareerdc',
    boardUrl: 'https://disney.wd5.myworkdayjobs.com/disneycareerdc?q=intern'
  },
  {
    company: 'Thomson Reuters',
    sector: 'tech',
    kind: 'workday',
    host: 'https://thomsonreuters.wd5.myworkdayjobs.com',
    tenant: 'thomsonreuters',
    site: 'External_Career_Site',
    boardUrl: 'https://thomsonreuters.wd5.myworkdayjobs.com/External_Career_Site?q=intern'
  },
  {
    company: 'Thornton Tomasetti',
    sector: 'tech',
    kind: 'workday',
    host: 'https://tt.wd503.myworkdayjobs.com',
    tenant: 'tt',
    site: 'thorntontomasetti',
    boardUrl: 'https://tt.wd503.myworkdayjobs.com/thorntontomasetti?q=intern'
  },
  {
    company: 'TJX',
    sector: 'tech',
    kind: 'workday',
    host: 'https://tjx.wd1.myworkdayjobs.com',
    tenant: 'tjx',
    site: 'tjx_external',
    boardUrl: 'https://tjx.wd1.myworkdayjobs.com/tjx_external?q=intern'
  },
  {
    company: 'Trane Technologies',
    sector: 'tech',
    kind: 'workday',
    host: 'https://tranetechnologies.wd12.myworkdayjobs.com',
    tenant: 'tranetechnologies',
    site: 'Trane_Technologies_Careers',
    boardUrl: 'https://tranetechnologies.wd12.myworkdayjobs.com/Trane_Technologies_Careers?q=intern'
  },
  {
    company: 'Transamerica',
    sector: 'tech',
    kind: 'workday',
    host: 'https://transamerica.wd5.myworkdayjobs.com',
    tenant: 'transamerica',
    site: 'US',
    boardUrl: 'https://transamerica.wd5.myworkdayjobs.com/US?q=intern'
  },
  {
    company: 'TransMarket Group',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'transmarketgroup',
    boardUrl: 'https://job-boards.greenhouse.io/transmarketgroup'
  },
  {
    company: 'Trimble',
    sector: 'tech',
    kind: 'workday',
    host: 'https://trimble.wd1.myworkdayjobs.com',
    tenant: 'trimble',
    site: 'TrimbleCareers',
    boardUrl: 'https://trimble.wd1.myworkdayjobs.com/TrimbleCareers?q=intern'
  },
  {
    company: 'TSC',
    sector: 'tech',
    kind: 'workday',
    host: 'https://tsc.wd12.myworkdayjobs.com',
    tenant: 'tsc',
    site: 'TSC-Careers',
    boardUrl: 'https://tsc.wd12.myworkdayjobs.com/TSC-Careers?q=intern'
  },
  {
    company: 'Tutor Intelligence',
    sector: 'tech',
    kind: 'lever',
    board: 'tutorintelligence',
    boardUrl: 'https://jobs.lever.co/tutorintelligence'
  },
  {
    company: 'Uber',
    sector: 'tech',
    kind: 'link',
    boardUrl: 'https://job-boards.greenhouse.io/uber'
  },
  {
    company: 'Uline',
    sector: 'tech',
    kind: 'workday',
    host: 'https://uline.wd1.myworkdayjobs.com',
    tenant: 'uline',
    site: 'Uline_Careers',
    boardUrl: 'https://uline.wd1.myworkdayjobs.com/Uline_Careers?q=intern'
  },
  {
    company: 'Unify',
    sector: 'tech',
    kind: 'ashby',
    board: 'unify',
    boardUrl: 'https://jobs.ashbyhq.com/unify'
  },
  {
    company: 'University of Rochester',
    sector: 'healthcare',
    kind: 'workday',
    host: 'https://rochester.wd5.myworkdayjobs.com',
    tenant: 'rochester',
    site: 'UR_Staff',
    boardUrl: 'https://rochester.wd5.myworkdayjobs.com/UR_Staff?q=intern'
  },
  {
    company: 'University System of New Hampshire',
    sector: 'tech',
    kind: 'workday',
    host: 'https://usnh.wd5.myworkdayjobs.com',
    tenant: 'usnh',
    site: 'Careers',
    boardUrl: 'https://usnh.wd5.myworkdayjobs.com/Careers?q=intern'
  },
  {
    company: 'Valstad',
    sector: 'tech',
    kind: 'ashby',
    board: 'valstad',
    boardUrl: 'https://jobs.ashbyhq.com/valstad'
  },
  {
    company: 'Vanguard',
    sector: 'tech',
    kind: 'workday',
    host: 'https://vanguard.wd5.myworkdayjobs.com',
    tenant: 'vanguard',
    site: 'vanguard_external',
    boardUrl: 'https://vanguard.wd5.myworkdayjobs.com/vanguard_external?q=intern'
  },
  {
    company: 'Varda Space',
    sector: 'aerospace',
    kind: 'greenhouse',
    board: 'vardaspace',
    boardUrl: 'https://job-boards.greenhouse.io/vardaspace'
  },
  {
    company: 'Vendelux',
    sector: 'tech',
    kind: 'ashby',
    board: 'vendelux',
    boardUrl: 'https://jobs.ashbyhq.com/vendelux'
  },
  {
    company: 'Veolia Environnement SA',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'VeoliaEnvironnementSA',
    boardUrl: 'https://jobs.smartrecruiters.com/VeoliaEnvironnementSA'
  },
  {
    company: 'Verkada',
    sector: 'tech',
    kind: 'greenhouse',
    board: 'verkada',
    boardUrl: 'https://job-boards.greenhouse.io/verkada'
  },
  {
    company: 'Vermeer',
    sector: 'tech',
    kind: 'workday',
    host: 'https://vermeer.wd5.myworkdayjobs.com',
    tenant: 'vermeer',
    site: 'externalcareersite',
    boardUrl: 'https://vermeer.wd5.myworkdayjobs.com/externalcareersite?q=intern'
  },
  {
    company: 'Verne Robotics',
    sector: 'tech',
    kind: 'ashby',
    board: 'Verne Robotics',
    boardUrl: 'https://jobs.ashbyhq.com/Verne Robotics'
  },
  {
    company: 'Viavi Solutions',
    sector: 'tech',
    kind: 'workday',
    host: 'https://viavisolutions.wd1.myworkdayjobs.com',
    tenant: 'viavisolutions',
    site: 'careers',
    boardUrl: 'https://viavisolutions.wd1.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Virtu Financial',
    sector: 'finance',
    kind: 'greenhouse',
    board: 'virtu',
    boardUrl: 'https://job-boards.greenhouse.io/virtu'
  },
  {
    company: 'VITAL LYFE',
    sector: 'tech',
    kind: 'ashby',
    board: 'vital-lyfe',
    boardUrl: 'https://jobs.ashbyhq.com/vital-lyfe'
  },
  {
    company: 'Voltus',
    sector: 'tech',
    kind: 'lever',
    board: 'voltus',
    boardUrl: 'https://jobs.lever.co/voltus'
  },
  {
    company: 'Western Digital',
    sector: 'tech',
    kind: 'smartrecruiters',
    board: 'WesternDigital',
    boardUrl: 'https://jobs.smartrecruiters.com/WesternDigital'
  },
  {
    company: 'WindBorne Systems',
    sector: 'tech',
    kind: 'ashby',
    board: 'windborne-systems',
    boardUrl: 'https://jobs.ashbyhq.com/windborne-systems'
  },
  {
    company: 'Wonder',
    sector: 'tech',
    kind: 'workday',
    host: 'https://wonder.wd1.myworkdayjobs.com',
    tenant: 'wonder',
    site: 'WG',
    boardUrl: 'https://wonder.wd1.myworkdayjobs.com/WG?q=intern'
  },
  {
    company: 'Workiva',
    sector: 'tech',
    kind: 'workday',
    host: 'https://workiva.wd503.myworkdayjobs.com',
    tenant: 'workiva',
    site: 'careers',
    boardUrl: 'https://workiva.wd503.myworkdayjobs.com/careers?q=intern'
  },
  {
    company: 'Xsolla',
    sector: 'tech',
    kind: 'lever',
    board: 'xsolla',
    boardUrl: 'https://jobs.lever.co/xsolla'
  },
  {
    company: 'Yotta Labs',
    sector: 'tech',
    kind: 'ashby',
    board: 'yotta',
    boardUrl: 'https://jobs.ashbyhq.com/yotta'
  },
  {
    company: 'Zoox',
    sector: 'auto',
    kind: 'lever',
    board: 'zoox',
    boardUrl: 'https://jobs.lever.co/zoox'
  }
]

export function careerBoardsOfKind(kind) {
  return CAREER_BOARDS.filter((board) => board.kind === kind)
}

export function careerBoardOverrides() {
  const overrides = {}
  for (const board of CAREER_BOARDS) {
    const key = String(board.company || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9.+]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (key && board.boardUrl) {
      overrides[key] = board.boardUrl
    }
  }
  return overrides
}
