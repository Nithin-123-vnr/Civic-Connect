import { createContext, useContext, useState, type ReactNode } from 'react';

export type SupportedLanguage = 'en' | 'te' | 'hi';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languageName: string;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation & General
    home: 'Home',
    myCases: 'My Cases',
    report: 'Report',
    explore: 'Explore',
    profile: 'Profile',
    dashboard: 'Dashboard',
    complaints: 'Complaints',
    escalations: 'Escalations',
    analytics: 'Analytics',
    alerts: 'Alerts',
    userDirectory: 'User Directory',
    mapView: 'Map View',
    logout: 'Logout',
    signIn: 'Sign In',
    saveChanges: 'Save Changes',
    loading: 'Loading...',
    continue: 'Continue',
    back: 'Back',
    viewAll: 'View All',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    hoursAgo: 'h ago',
    reported: 'Reported',
    verifiedCitizen: 'Verified Citizen',

    // Roles
    citizen: 'Citizen',
    mandalOfficer: 'Mandal Officer',
    districtOfficer: 'District Officer',
    stateAdmin: 'State Admin',

    // Statuses
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    escalated: 'Escalated',
    reopened: 'Reopened',
    rejected: 'Rejected',
    closed: 'Closed',

    // Priorities
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',

    // Categories
    roads: 'Roads & Footpaths',
    water: 'Water Supply',
    drainage: 'Drainage & Sewage',
    sanitation: 'Sanitation & Waste',
    electricity: 'Electricity & Lights',
    parks: 'Parks & Greenery',
    public_safety: 'Public Safety',
    disaster_mgmt: 'Disaster Management',
    other: 'Other Civic Issues',

    // Citizen Home Screen
    goodMorning: 'Good morning,',
    officialCitizenRedressal: 'Official Citizen Redressal',
    spottedCivicProblem: 'Spotted a civic problem in your neighborhood?',
    reportPotholesDesc: 'Report potholes, water leakages, garbage, or power cuts directly to your designated Mandal Officer.',
    fileNewGrievance: 'File New Grievance',
    activeGrievanceTracking: 'Active Grievance Tracking',
    viewTimeline: 'View Timeline',
    popularCategories: 'Popular Categories',
    recentGrievances: 'Recent Grievances',

    // My Complaints Screen
    myGrievances: 'My Grievances',
    searchPlaceholder: 'Search by ID, title, or category...',
    allCases: 'All Cases',
    inProgressTab: 'In Progress',
    resolvedTab: 'Resolved',
    escalatedTab: 'Escalated',
    noGrievancesFound: 'No grievances found',
    noGrievancesDesc: 'You have not submitted any complaints in this category yet.',
    noSearchMatch: 'No matching complaints found for your search criteria.',
    fileAGrievance: 'File a Grievance',

    // Report Wizard
    step: 'Step',
    of: 'of',
    selectCategory: 'Select Problem Category',
    selectCategoryDesc: 'Choose the primary civic issue you want to report.',
    grievanceDetails: 'Grievance Details',
    grievanceDetailsDesc: 'Describe the issue clearly with exact location notes.',
    complaintTitle: 'Complaint Title *',
    titlePlaceholder: 'e.g. Broken water pipe leaking on main road',
    detailedDescription: 'Detailed Description *',
    descPlaceholder: 'Explain what is broken, how long it has been an issue...',
    urgencyPriority: 'Urgency / Severity Level',
    grievanceLocation: 'Grievance Location',
    locationDesc: 'Pin the exact location of the civic defect on the map.',
    detectGPS: 'Detect GPS',
    detecting: 'Detecting...',
    state: 'State',
    district: 'District *',
    selectDistrict: 'Select District',
    mandalWard: 'Mandal / Ward *',
    selectMandal: 'Select Mandal',
    areaStreet: 'Colony / Area / Street',
    areaPlaceholder: 'e.g. Road No 36, Near Pillar 140',
    landmark: 'Prominent Landmark',
    landmarkPlaceholder: 'e.g. Opposite Community Hall',
    uploadPhotos: 'Upload Photo Evidence',
    uploadPhotosDesc: 'Add clear on-site photos to accelerate field inspection.',
    addPhoto: 'Take or Upload Photo',
    reviewSubmit: 'Review & Submit',
    reviewDesc: 'Confirm grievance details before final registration.',
    submitGrievance: 'Submit Grievance',
    submitting: 'Submitting...',
    photosAdded: 'Photos Added',
    locationSummary: 'Location Summary',
    categorySummary: 'Category',
    prioritySummary: 'Priority Level',
    targetSla: 'Target Statutory SLA',

    // Case Detail & Timeline
    liveCaseTracker: 'Live Case Tracker',
    grievanceTimeline: 'Grievance Redressal Timeline',
    reopenCase: 'Reopen Case',
    rateResolution: 'Rate Resolution & Provide Feedback',
    submitFeedback: 'Submit Feedback',
    reopenReasonPlaceholder: 'Explain why you are reopening this grievance...',
    caseNotFound: 'Case Not Found',
    caseNotFoundDesc: 'The requested complaint could not be found or has been archived.',

    // Master Enhancements
    liveComplaintJourney: 'Live Complaint Journey',
    realtimeAuditTrail: 'Real-time verified status progression and administrative audit trail',
    currentStage: 'Current Stage',
    resolutionEvidence: 'Resolution Evidence & Field Verification',
    beforeReportedEvidence: 'BEFORE — Citizen Reported Evidence',
    afterResolutionEvidence: 'AFTER — Official Resolution Evidence',
    evidenceComparisonDesc: 'Official photographic comparison of the reported issue versus completed field civil works.',
    governmentActionChain: 'Government Action Chain',
    participatingAuthorities: 'Administrative tiers actively involved in the investigation and redressal of this grievance',
    resolvedAwaitingConfirmation: 'Resolved — Awaiting Citizen Confirmation',
    officerMarkedResolvedDesc: 'An official has completed field works and marked this grievance as resolved. Please inspect the site or evidence and confirm if the issue is completely fixed.',
    hasThisIssueBeenResolved: 'Has this issue been resolved to your satisfaction?',
    confirmationImpactNote: 'Your confirmation will formally close this grievance in the Telangana State Registry.',
    yesIssueResolved: 'Yes, Issue Resolved',
    noIssueStillExists: 'No, Issue Still Exists',
    actionRequired: 'Action Required',
    noResolutionEvidenceUploaded: 'No resolution photos uploaded by the officer yet.',
    noBeforeEvidence: 'No evidence uploaded by citizen at submission time.',

    // Submission Success
    grievanceRegistered: 'Grievance Registered!',
    successSubtitle: 'Your complaint has been logged into the Official CivicConnect State Redressal System.',
    trackingId: 'Tracking ID',
    assignedAuthority: 'Assigned Authority',
    trackGrievanceLive: 'Track Grievance Live',
    backToHome: 'Back to Home',

    // Profile Screen
    profileTitle: 'Officer Identity & Jurisdiction Profile',
    citizenProfile: 'Citizen Profile',
    registeredJurisdiction: 'Registered Municipal Jurisdiction',
    officialDetails: 'Official Details',
    jurisdictionScope: 'Administrative Jurisdiction',
    systemPrivileges: 'System Access & Privileges',
    preferencesSettings: 'Preferences & Settings',
    portalPreferences: 'Portal Preferences & Language',
    portalLanguage: 'Portal Display Language',
    selectLanguage: 'Portal Display Language',
    smsNotifications: 'SMS / WhatsApp Notifications',
    helpFaqs: 'Help & Citizen FAQs',
    activeStatus: 'Active & Verified',
    stateGovernance: 'State Governance',
    helplineText: 'State Toll-Free Helpline: 1902',
    faq1Q: 'How are complaint resolution SLAs determined?',
    faq1A: 'SLAs are calculated based on grievance severity: Critical (24 hours), High (48 hours), Medium (72 hours), and Low (120 hours). If unaddressed, cases auto-escalate.',
    faq2Q: 'Can I track field officer inspection on a map?',
    faq2A: 'Yes, once a field engineer is dispatched, real-time audit updates appear in your grievance tracking timeline.',
    faq3Q: 'What if I am dissatisfied with the resolution?',
    faq3A: 'You can reopen your case within 7 days of resolution by clicking "Reopen Case" in the case detail view, which transfers it to the District Grievance Cell.',

    // Notifications & Map
    alertsUpdates: 'Alerts & Updates',
    allAlerts: 'All Alerts',
    unread: 'Unread',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications yet',
    noNotificationsDesc: 'You will receive updates here as your grievances are inspected and resolved.',
    localGrievanceMap: 'Local Grievance Map',
  },
  te: {
    // Navigation & General
    home: 'హోమ్',
    myCases: 'నా ఫిర్యాదులు',
    report: 'ఫిర్యాదు చేయండి',
    explore: 'అన్వేషించండి',
    profile: 'ప్రొఫైల్',
    dashboard: 'డ్యాష్‌బోర్డ్',
    complaints: 'ఫిర్యాదులు',
    escalations: 'తీవ్ర సమస్యలు',
    analytics: 'విశ్లేషణలు',
    alerts: 'హెచ్చరికలు',
    userDirectory: 'అధికారుల జాబితా',
    mapView: 'మ్యాప్ వీక్షణ',
    logout: 'లాగౌట్',
    signIn: 'లాగిన్ అవ్వండి',
    saveChanges: 'మార్పులను భద్రపరచండి',
    loading: 'లోడ్ అవుతోంది...',
    continue: 'కొనసాగించండి',
    back: 'వెనుకకు',
    viewAll: 'అన్నీ చూడండి',
    today: 'ఈ రోజు',
    yesterday: 'నిన్న',
    daysAgo: 'రోజుల క్రితం',
    hoursAgo: 'గంటల క్రితం',
    reported: 'నమోదైంది',
    verifiedCitizen: 'ధృవీకరించబడిన పౌరుడు',

    // Roles
    citizen: 'పౌరుడు',
    mandalOfficer: 'మండల అధికారి',
    districtOfficer: 'జిల్లా అధికారి',
    stateAdmin: 'రాష్ట్ర అడ్మినిస్ట్రేటర్',

    // Statuses
    pending: 'పరిశీలనలో ఉంది',
    assigned: 'కేటాయించబడింది',
    in_progress: 'పురోగతిలో ఉంది',
    resolved: 'పరిష్కరించబడింది',
    escalated: 'ఉన్నతాధికారులకు చేరింది',
    reopened: 'తిరిగి తెరవబడింది',
    rejected: 'తిరస్కరించబడింది',
    closed: 'ముగించబడింది',

    // Priorities
    low: 'తక్కువ',
    medium: 'మధ్యస్థం',
    high: 'అధికం',
    critical: 'తీవ్రమైనది',

    // Categories
    roads: 'రహదారులు & పాదచారుల బాట',
    water: 'తాగునీటి సరఫరా',
    drainage: 'డ్రైనేజీ & మురుగునీరు',
    sanitation: 'పారిశుధ్యం & చెత్త నిర్వహణ',
    electricity: 'విద్యుత్ & వీధి దీపాలు',
    parks: 'పార్కులు & పచ్చదనం',
    public_safety: 'ప్రజా భద్రత',
    disaster_mgmt: 'విపత్తు నిర్వహణ',
    other: 'ఇతర ప్రజా సమస్యలు',

    // Citizen Home Screen
    goodMorning: 'శుభోదయం,',
    officialCitizenRedressal: 'అధికారిక పౌర సమస్యల పరిష్కారం',
    spottedCivicProblem: 'మీ పరిసరాల్లో ఏదైనా ప్రజా సమస్య గమనించారా?',
    reportPotholesDesc: 'గుంతలు, నీటి లీకేజీలు, చెత్త లేదా విద్యుత్ అంతరాయాలను నేరుగా మీ మండల అధికారికి ఫిర్యాదు చేయండి.',
    fileNewGrievance: 'కొత్త ఫిర్యాదు నమోదు చేయండి',
    activeGrievanceTracking: 'క్రియాశీల ఫిర్యాదు ట్రాకింగ్',
    viewTimeline: 'టైమ్‌లైన్ చూడండి',
    popularCategories: 'ప్రజా సమస్యల విభాగాలు',
    recentGrievances: 'ఇటీవలి ఫిర్యాదులు',

    // My Complaints Screen
    myGrievances: 'నా ఫిర్యాదులు',
    searchPlaceholder: 'ఐడీ, శీర్షిక లేదా విభాగం ద్వారా శోధించండి...',
    allCases: 'అన్ని కేసులు',
    inProgressTab: 'పురోగతిలో ఉన్నవి',
    resolvedTab: 'పరిష్కరించబడినవి',
    escalatedTab: 'ఉన్నతాధికారుల వద్ద ఉన్నవి',
    noGrievancesFound: 'ఎటువంటి ఫిర్యాదులు కనుగొనబడలేదు',
    noGrievancesDesc: 'మీరు ఈ విభాగంలో ఇంకా ఎటువంటి ఫిర్యాదులు చేయలేదు.',
    noSearchMatch: 'మీ శోధనకు సరిపోలే ఫిర్యాదులు ఏవీ లేవు.',
    fileAGrievance: 'ఫిర్యాదు చేయండి',

    // Report Wizard
    step: 'దశ',
    of: '/',
    selectCategory: 'సమస్య విభాగాన్ని ఎంచుకోండి',
    selectCategoryDesc: 'మీరు నివేదించాలనుకుంటున్న ప్రధాన పౌర సమస్యను ఎంచుకోండి.',
    grievanceDetails: 'ఫిర్యాదు వివరాలు',
    grievanceDetailsDesc: 'ఖచ్చితమైన ప్రదేశ వివరాలతో సమస్యను స్పష్టంగా వివరించండి.',
    complaintTitle: 'ఫిర్యాదు శీర్షిక *',
    titlePlaceholder: 'ఉదా: ప్రధాన రహదారిపై పగిలిన తాగునీటి పైపు',
    detailedDescription: 'వివరణాత్మక సమాచారం *',
    descPlaceholder: 'సమస్య ఏమిటి, ఎంతకాలంగా ఉంది అనే వివరాలు రాయండి...',
    urgencyPriority: 'తీవ్రత / ప్రాధాన్యత స్థాయి',
    grievanceLocation: 'సమస్య ఉన్న ప్రదేశం',
    locationDesc: 'మ్యాప్‌పై సమస్య ఉన్న ఖచ్చితమైన ప్రదేశాన్ని గుర్తించండి.',
    detectGPS: 'జీపీఎస్ గుర్తించండి',
    detecting: 'గుర్తిస్తోంది...',
    state: 'రాష్ట్రం',
    district: 'జిల్లా *',
    selectDistrict: 'జిల్లాను ఎంచుకోండి',
    mandalWard: 'మండలం / వార్డు *',
    selectMandal: 'మండలాన్ని ఎంచుకోండి',
    areaStreet: 'కాలనీ / ప్రాంతం / వీధి',
    areaPlaceholder: 'ఉదా: రోడ్ నెం 36, పిల్లర్ 140 దగ్గర',
    landmark: 'ప్రముఖ మైలురాయి / గుర్తు',
    landmarkPlaceholder: 'ఉదా: కమ్యూనిటీ హాల్ ఎదురుగా',
    uploadPhotos: 'ఫోటో సాక్ష్యాలు అప్‌లోడ్ చేయండి',
    uploadPhotosDesc: 'త్వరిత క్షేత్ర స్థాయి తనిఖీ కోసం స్పష్టమైన ఫోటోలను జోడించండి.',
    addPhoto: 'ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి',
    reviewSubmit: 'సమీక్షించి సమర్పించండి',
    reviewDesc: 'తుది నమోదుకు ముందు ఫిర్యాదు వివరాలను ధృవీకరించుకోండి.',
    submitGrievance: 'ఫిర్యాదును సమర్పించండి',
    submitting: 'సమర్పిస్తోంది...',
    photosAdded: 'ఫోటోలు జోడించబడ్డాయి',
    locationSummary: 'ప్రదేశ వివరాలు',
    categorySummary: 'సమస్య విభాగం',
    prioritySummary: 'ప్రాధాన్యత స్థాయి',
    targetSla: 'పరిష్కార గడువు (SLA)',

    // Case Detail & Timeline
    liveCaseTracker: 'ప్రత్యక్ష ఫిర్యాదు ట్రాకర్',
    grievanceTimeline: 'ఫిర్యాదు పరిష్కార కాలక్రమం',
    reopenCase: 'ఫిర్యాదును తిరిగి తెరవండి',
    rateResolution: 'పరిష్కారంపై రేటింగ్ & స్పందన తెలపండి',
    submitFeedback: 'స్పందనను సమర్పించండి',
    reopenReasonPlaceholder: 'మీరు ఈ సమస్యను ఎందుకు తిరిగి తెరుస్తున్నారో వివరించండి...',
    caseNotFound: 'ఫిర్యాదు కనుగొనబడలేదు',
    caseNotFoundDesc: 'అభ్యర్థించిన ఫిర్యాదు కనుగొనబడలేదు లేదా ఆర్కైవ్ చేయబడింది.',

    // Master Enhancements
    liveComplaintJourney: 'ప్రత్యక్ష ఫిర్యాదు ప్రయాణం',
    realtimeAuditTrail: 'ధృవీకరించబడిన స్థితి పురోగతి మరియు అధికారిక ఆడిట్ వివరాలు',
    currentStage: 'ప్రస్తుత దశ',
    resolutionEvidence: 'పరిష్కార ఆధారాలు & ఫీల్డ్ ధృవీకరణ',
    beforeReportedEvidence: 'ముందు — పౌరుడు సమర్పించిన సమస్య ఫోటోలు',
    afterResolutionEvidence: 'తరువాత — అధికారి సమర్పించిన పరిష్కార ఫోటోలు',
    evidenceComparisonDesc: 'సమస్య నమోదైనప్పటి ఫోటోలు మరియు పనులు పూర్తయిన తర్వాత తీసిన ఫోటోల సరిపోలిక.',
    governmentActionChain: 'ప్రభుత్వ చర్యల గొలుసు',
    participatingAuthorities: 'ఈ సమస్య పరిష్కారంలో పాల్గొన్న పరిపాలనా అధికార వర్గాలు',
    resolvedAwaitingConfirmation: 'పరిష్కరించబడింది — పౌరుడి ధృవీకరణ కోసం వేచి ఉంది',
    officerMarkedResolvedDesc: 'అధికారి పనులు పూర్తి చేసి సమస్యను పరిష్కరించినట్లు నమోదు చేశారు. దయచేసి పరిశీలించి సమస్య పూర్తిగా పరిష్కారమైందో లేదో ధృవీకరించండి.',
    hasThisIssueBeenResolved: 'ఈ సమస్య మీకు సంతృప్తికరంగా పరిష్కరించబడిందా?',
    confirmationImpactNote: 'మీ ధృవీకరణ ద్వారా ఈ ఫిర్యాదు రాష్ట్ర రిజిస్ట్రీలో అధికారికంగా ముగించబడుతుంది.',
    yesIssueResolved: 'అవును, సమస్య పరిష్కారమైంది',
    noIssueStillExists: 'లేదు, సమస్య ఇంకా ఉంది',
    actionRequired: 'చర్య అవసరం',
    noResolutionEvidenceUploaded: 'అధికారి ఇంకా పరిష్కార ఫోటోలను అప్‌లోడ్ చేయలేదు.',
    noBeforeEvidence: 'ఫిర్యాదు నమోదు సమయంలో ఎటువంటి ఫోటోలు సమర్పించబడలేదు.',

    // Submission Success
    grievanceRegistered: 'ఫిర్యాదు విజయవంతంగా నమోదైంది!',
    successSubtitle: 'మీ ఫిర్యాదు అధికారిక సివిక్‌కనెక్ట్ ప్రజా సమస్యల పరిష్కార వ్యవస్థలో నమోదు చేయబడింది.',
    trackingId: 'ట్రాకింగ్ ఐడీ',
    assignedAuthority: 'కేటాయించిన అధికారి',
    trackGrievanceLive: 'ఫిర్యాదును ప్రత్యక్షంగా ట్రాక్ చేయండి',
    backToHome: 'హోమ్‌కు తిరిగి వెళ్లండి',

    // Profile Screen
    profileTitle: 'అధికారిక గుర్తింపు & అధికార పరిధి ప్రొఫైల్',
    citizenProfile: 'పౌరుడి ప్రొఫైల్',
    registeredJurisdiction: 'నమోదిత పరిపాలనా అధికార పరిధి',
    officialDetails: 'అధికారిక వివరాలు',
    jurisdictionScope: 'పరిపాలనా అధికార పరిధి',
    systemPrivileges: 'వ్యవస్థ అనుమతులు',
    preferencesSettings: 'ప్రాధాన్యతలు & సెట్టింగ్‌లు',
    portalPreferences: 'పోర్టల్ ప్రాధాన్యతలు & భాష',
    portalLanguage: 'పోర్టల్ ప్రదర్శన భాష',
    selectLanguage: 'పోర్టల్ ప్రదర్శన భాష',
    smsNotifications: 'SMS / వాట్సాప్ నోటిఫికేషన్‌లు',
    helpFaqs: 'సహాయం & తరచుగా అడిగే ప్రశ్నలు',
    activeStatus: 'క్రియాశీలకంగా ఉంది',
    stateGovernance: 'రాష్ట్ర పాలన',
    helplineText: 'రాష్ట్ర ఉచిత హెల్ప్‌లైన్: 1902',
    faq1Q: 'ఫిర్యాదుల పరిష్కార గడువు (SLA) ఎలా నిర్ణయిస్తారు?',
    faq1A: 'సమస్య తీవ్రత ఆధారంగా గడువు నిర్ణయించబడుతుంది: తీవ్రమైనది (24 గంటలు), అధికం (48 గంటలు), మధ్యస్థం (72 గంటలు), తక్కువ (120 గంటలు). గడువులోగా పరిష్కరించకపోతే ఉన్నతాధికారులకు వెళ్తుంది.',
    faq2Q: 'ఫీల్డ్ అధికారి తనిఖీని మ్యాప్‌లో చూడవచ్చా?',
    faq2A: 'అవును, ఫీల్డ్ ఇంజనీర్ కేటాయించబడిన వెంటనే మీ ట్రాకింగ్ టైమ్‌లైన్‌లో లైవ్ అప్‌డేట్‌లు కనిపిస్తాయి.',
    faq3Q: 'పరిష్కారం సంతృప్తికరంగా లేకపోతే ఏమి చేయాలి?',
    faq3A: 'సమస్య పరిష్కరించబడిన 7 రోజులలోపు "ఫిర్యాదును తిరిగి తెరవండి" క్లిక్ చేయవచ్చు, ఇది జిల్లా గ్రీవెన్స్ సెల్‌కు బదిలీ అవుతుంది.',

    // Notifications & Map
    alertsUpdates: 'హెచ్చరికలు & సమాచారం',
    allAlerts: 'అన్ని హెచ్చరికలు',
    unread: 'చదవనివి',
    markAllRead: 'అన్నీ చదివినట్లు గుర్తించండి',
    noNotifications: 'ఇంకా ఎటువంటి నోటిఫికేషన్‌లు లేవు',
    noNotificationsDesc: 'మీ ఫిర్యాదులు పరిశీలించి పరిష్కరించబడినప్పుడు ఇక్కడ సమాచారం అందుతుంది.',
    localGrievanceMap: 'స్థానిక సమస్యల మ్యాప్',
  },
  hi: {
    // Navigation & General
    home: 'होम',
    myCases: 'मेरे मामले',
    report: 'शिकायत करें',
    explore: 'खोजें',
    profile: 'प्रोफ़ाइल',
    dashboard: 'डैशबोर्ड',
    complaints: 'शिकायतें',
    escalations: 'एस्केलेशन',
    analytics: 'एनालिटिक्स',
    alerts: 'अलर्ट्स',
    userDirectory: 'अधिकारी निर्देशिका',
    mapView: 'मानचित्र दृश्य',
    logout: 'लॉग आउट',
    signIn: 'साइन इन करें',
    saveChanges: 'परिवर्तन सहेजें',
    loading: 'लोड हो रहा है...',
    continue: 'आगे बढ़ें',
    back: 'पीछे',
    viewAll: 'सभी देखें',
    today: 'आज',
    yesterday: 'कल',
    daysAgo: 'दिन पहले',
    hoursAgo: 'घंटे पहले',
    reported: 'दर्ज किया गया',
    verifiedCitizen: 'सत्यापित नागरिक',

    // Roles
    citizen: 'नागरिक',
    mandalOfficer: 'मंडल अधिकारी',
    districtOfficer: 'जिला अधिकारी',
    stateAdmin: 'राज्य व्यवस्थापक',

    // Statuses
    pending: 'लंबित',
    assigned: 'सौंपा गया',
    in_progress: 'प्रगति पर है',
    resolved: 'हल किया गया',
    escalated: 'उच्च स्तर पर भेजा गया',
    reopened: 'पुनः खोला गया',
    rejected: 'अस्वीकृत',
    closed: 'बंद',

    // Priorities
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    critical: 'अति गंभीर',

    // Categories
    roads: 'सड़कें और फुटपाथ',
    water: 'पेयजल आपूर्ति',
    drainage: 'जल निकासी और सीवेज',
    sanitation: 'स्वच्छता और कचरा प्रबंधन',
    electricity: 'बिजली और स्ट्रीट लाइट',
    parks: 'पार्क और हरियाली',
    public_safety: 'सार्वजनिक सुरक्षा',
    disaster_mgmt: 'आपदा प्रबंधन',
    other: 'अन्य नागरिक समस्याएं',

    // Citizen Home Screen
    goodMorning: 'सुप्रभात,',
    officialCitizenRedressal: 'आधिकारिक नागरिक निवारण',
    spottedCivicProblem: 'क्या आपके आस-पास कोई नागरिक समस्या है?',
    reportPotholesDesc: 'सड़क के गड्ढों, पानी के रिसाव, कचरे या बिजली कटौती की शिकायत सीधे अपने मंडल अधिकारी से करें।',
    fileNewGrievance: 'नई शिकायत दर्ज करें',
    activeGrievanceTracking: 'सक्रिय शिकायत ट्रैकिंग',
    viewTimeline: 'समयरेखा देखें',
    popularCategories: 'लोकप्रिय श्रेणियां',
    recentGrievances: 'हाल की शिकायतें',

    // My Complaints Screen
    myGrievances: 'मेरी शिकायतें',
    searchPlaceholder: 'आईडी, शीर्षक या श्रेणी से खोजें...',
    allCases: 'सभी मामले',
    inProgressTab: 'प्रगति पर है',
    resolvedTab: 'हल किए गए',
    escalatedTab: 'उच्च स्तर पर भेजे गए',
    noGrievancesFound: 'कोई शिकायत नहीं मिली',
    noGrievancesDesc: 'आपने अभी तक इस श्रेणी में कोई शिकायत दर्ज नहीं की है।',
    noSearchMatch: 'आपकी खोज से मेल खाने वाली कोई शिकायत नहीं मिली।',
    fileAGrievance: 'शिकायत दर्ज करें',

    // Report Wizard
    step: 'चरण',
    of: '/',
    selectCategory: 'समस्या की श्रेणी चुनें',
    selectCategoryDesc: 'उस मुख्य नागरिक समस्या का चयन करें जिसकी आप रिपोर्ट करना चाहते हैं।',
    grievanceDetails: 'शिकायत का विवरण',
    grievanceDetailsDesc: 'सटीक स्थान विवरण के साथ समस्या का स्पष्ट वर्णन करें।',
    complaintTitle: 'शिकायत का शीर्षक *',
    titlePlaceholder: 'उदा. मुख्य सड़क पर पाइप से पानी का रिसाव',
    detailedDescription: 'विस्तृत विवरण *',
    descPlaceholder: 'समस्या क्या है, कितने समय से है, विस्तार से बताएं...',
    urgencyPriority: 'गंभीरता / प्राथमिकता स्तर',
    grievanceLocation: 'शिकायत का स्थान',
    locationDesc: 'मानचित्र पर नागरिक दोष का सटीक स्थान चिन्हित करें।',
    detectGPS: 'जीपीएस से खोजें',
    detecting: 'खोज रहा है...',
    state: 'राज्य',
    district: 'जिला *',
    selectDistrict: 'जिला चुनें',
    mandalWard: 'मंडल / वार्ड *',
    selectMandal: 'मंडल चुनें',
    areaStreet: 'कॉलोनी / क्षेत्र / सड़क',
    areaPlaceholder: 'उदा. रोड नं 36, पिलर 140 के पास',
    landmark: 'प्रमुख लैंडमार्क',
    landmarkPlaceholder: 'उदा. सामुदायिक केंद्र के सामने',
    uploadPhotos: 'फोटो साक्ष्य अपलोड करें',
    uploadPhotosDesc: 'त्वरित निरीक्षण के लिए स्पष्ट तस्वीरें जोड़ें।',
    addPhoto: 'फोटो लें या अपलोड करें',
    reviewSubmit: 'समीक्षा करें और सबमिट करें',
    reviewDesc: 'अंतिम पंजीकरण से पहले शिकायत विवरण की पुष्टि करें।',
    submitGrievance: 'शिकायत सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    photosAdded: 'तस्वीरें जोड़ी गईं',
    locationSummary: 'स्थान विवरण',
    categorySummary: 'श्रेणी',
    prioritySummary: 'प्राथमिकता स्तर',
    targetSla: 'निवारण लक्ष्य (SLA)',

    // Case Detail & Timeline
    liveCaseTracker: 'लाइव केस ट्रैकर',
    grievanceTimeline: 'शिकायत निवारण समयरेखा',
    reopenCase: 'मामला फिर से खोलें',
    rateResolution: 'निवारण पर रेटिंग और फीडबैक दें',
    submitFeedback: 'फीडबैक सबमिट करें',
    reopenReasonPlaceholder: 'बताएं कि आप इस मामले को दोबारा क्यों खोल रहे हैं...',
    caseNotFound: 'शिकायत नहीं मिली',
    caseNotFoundDesc: 'अनुरोधित शिकायत नहीं मिली या संग्रहीत कर दी गई है।',

    // Master Enhancements
    liveComplaintJourney: 'लाइव शिकायत समाधान यात्रा',
    realtimeAuditTrail: 'सत्यापित स्थिति प्रगति और प्रशासनिक ऑडिट ट्रेल',
    currentStage: 'वर्तमान चरण',
    resolutionEvidence: 'समाधान साक्ष्य एवं स्थलीय सत्यापन',
    beforeReportedEvidence: 'पहले — नागरिक द्वारा प्रस्तुत साक्ष्य',
    afterResolutionEvidence: 'बाद में — आधिकारिक समाधान साक्ष्य',
    evidenceComparisonDesc: 'दर्ज की गई समस्या और पूरे हुए सिविल कार्यों की आधिकारिक फोटो तुलना।',
    governmentActionChain: 'सरकारी कार्रवाई श्रृंखला',
    participatingAuthorities: 'इस शिकायत के निवारण में सक्रिय रूप से शामिल प्रशासनिक स्तर',
    resolvedAwaitingConfirmation: 'हल किया गया — नागरिक पुष्टि की प्रतीक्षा में',
    officerMarkedResolvedDesc: 'अधिकारी ने कार्य पूरा कर लिया है और इसे हल के रूप में चिह्नित किया है। कृपया जांचें और पुष्टि करें कि क्या समस्या पूरी तरह ठीक हो गई है।',
    hasThisIssueBeenResolved: 'क्या यह समस्या आपकी संतुष्टि के अनुसार हल हो गई है?',
    confirmationImpactNote: 'आपकी पुष्टि से यह शिकायत तेलंगाना राज्य रजिस्ट्री में औपचारिक रूप से बंद हो जाएगी।',
    yesIssueResolved: 'हाँ, समस्या हल हो गई है',
    noIssueStillExists: 'नहीं, समस्या अभी भी बनी हुई है',
    actionRequired: 'कार्रवाई आवश्यक',
    noResolutionEvidenceUploaded: 'अधिकारी द्वारा अभी तक कोई समाधान फोटो अपलोड नहीं किया गया है।',
    noBeforeEvidence: 'शिकायत दर्ज करते समय नागरिक द्वारा कोई साक्ष्य अपलोड नहीं किया गया।',

    // Submission Success
    grievanceRegistered: 'शिकायत सफलतापूर्वक दर्ज की गई!',
    successSubtitle: 'आपकी शिकायत आधिकारिक सिविककनेक्ट राज्य निवारण प्रणाली में दर्ज कर ली गई है।',
    trackingId: 'ट्रैकिंग आईडी',
    assignedAuthority: 'सौंपा गया प्राधिकरण',
    trackGrievanceLive: 'शिकायत को लाइव ट्रैक करें',
    backToHome: 'होम पर वापस जाएं',

    // Profile Screen
    profileTitle: 'अधिकारिक पहचान एवं क्षेत्राधिकार प्रोफ़ाइल',
    citizenProfile: 'नागरिक प्रोफ़ाइल',
    registeredJurisdiction: 'पंजीकृत प्रशासनिक क्षेत्राधिकार',
    officialDetails: 'आधिकारिक विवरण',
    jurisdictionScope: 'प्रशासनिक क्षेत्राधिकार',
    systemPrivileges: 'सिस्टम विशेषाधिकार',
    preferencesSettings: 'प्राथमिकताएं एवं सेटिंग्स',
    portalPreferences: 'पोर्टल प्राथमिकताएं एवं भाषा',
    portalLanguage: 'पोर्टल प्रदर्शन भाषा',
    selectLanguage: 'पोर्टल प्रदर्शन भाषा',
    smsNotifications: 'एसएमएस / व्हाट्सएप सूचनाएं',
    helpFaqs: 'सहायता एवं अक्सर पूछे जाने वाले प्रश्न',
    activeStatus: 'सक्रिय एवं सत्यापित',
    stateGovernance: 'राज्य शासन',
    helplineText: 'राज्य टोल-फ्री हेल्पलाइन: 1902',
    faq1Q: 'शिकायत समाधान की समयसीमा (SLA) कैसे तय होती है?',
    faq1A: 'समयसीमा गंभीरता के आधार पर तय होती है: अति गंभीर (24 घंटे), उच्च (48 घंटे), मध्यम (72 घंटे), कम (120 घंटे)। समय पर समाधान न होने पर मामला अपने आप उच्च अधिकारी को जाता है।',
    faq2Q: 'क्या मैं मानचित्र पर अधिकारी के निरीक्षण को ट्रैक कर सकता हूँ?',
    faq2A: 'हाँ, फ़ील्ड इंजीनियर तैनात होते ही आपकी समयरेखा में लाइव अपडेट दिखाई देने लगेंगे।',
    faq3Q: 'यदि मैं समाधान से असंतुष्ट हूँ तो क्या करें?',
    faq3A: 'समाधान के 7 दिनों के भीतर आप "मामला फिर से खोलें" पर क्लिक कर सकते हैं, जिससे यह जिला निवारण प्रकोष्ठ को स्थानांतरित हो जाएगा।',

    // Notifications & Map
    alertsUpdates: 'अलर्ट और अपडेट',
    allAlerts: 'सभी अलर्ट',
    unread: 'अपठित',
    markAllRead: 'सभी को पढ़ा हुआ चिन्हित करें',
    noNotifications: 'अभी कोई सूचना नहीं है',
    noNotificationsDesc: 'जैसे ही आपकी शिकायतों का निरीक्षण और समाधान होगा, आपको यहाँ अपडेट प्राप्त होंगे।',
    localGrievanceMap: 'स्थानीय शिकायत मानचित्र',
  },
};

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English (US)',
  te: 'తెలుగు (Telugu)',
  hi: 'हिन्दी (Hindi)',
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('civicconnect_lang');
      if (saved === 'te' || saved === 'hi' || saved === 'en') return saved;
    } catch {
      // Ignore storage errors
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('civicconnect_lang', lang);
    } catch {
      // Ignore storage errors
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      languageName: LANGUAGE_NAMES[language],
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
