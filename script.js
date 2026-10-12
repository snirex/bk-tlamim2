
        // Helper: money formatter with direction:ltr for Tabulator
        function moneyFmt(cell) {
            const val = cell.getValue();
            const num = Number(val) || 0;
            cell.getElement().style.direction = 'ltr';
            cell.getElement().style.unicodeBidi = 'embed';
            return '₪' + num.toLocaleString();
        }

        // התחייבות — בד"כ מוצגת בפלוס (אדום = חוב), אך אם הוזן סכום שלילי (למשל יתרת פתיחה בזכות)
        // הכיוון מתהפך: זו למעשה הקטנת חוב, ולכן מוצגת במינוס (ירוק)
        function commitmentFmt(cell) {
            const num = Number(cell.getValue()) || 0;
            const el = cell.getElement();
            el.style.direction = 'ltr';
            el.style.unicodeBidi = 'embed';
            if (num === 0) return '₪0';
            if (num > 0) { el.style.color = '#dc3545'; el.style.fontWeight = '600'; return '+₪' + num.toLocaleString(); }
            el.style.color = '#28a745'; el.style.fontWeight = '600';
            return '-₪' + Math.abs(num).toLocaleString();
        }

        // תשלום — בד"כ מוצג במינוס (ירוק = הקטנת חוב), אך אם הוזן סכום שלילי (למשל ביטול/היפוך תשלום)
        // הכיוון מתהפך: זו למעשה הגדלת חוב, ולכן מוצג בפלוס (אדום)
        function paymentFmt(cell) {
            const num = Number(cell.getValue()) || 0;
            const el = cell.getElement();
            el.style.direction = 'ltr';
            el.style.unicodeBidi = 'embed';
            if (num === 0) return '₪0';
            if (num > 0) { el.style.color = '#28a745'; el.style.fontWeight = '600'; return '-₪' + num.toLocaleString(); }
            el.style.color = '#dc3545'; el.style.fontWeight = '600';
            return '+₪' + Math.abs(num).toLocaleString();
        }

        // Helper: convert YYYY-MM-DD → DD/MM/YYYY for display
        function formatDate(val) {
            if (!val) return '';
            const parts = String(val).split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                return parts[2] + '/' + parts[1] + '/' + parts[0];
            }
            return val;
        }

        // ===== DEMO MODE =====
        // הפעלה: הוספת ?demo=1 (או כל פרמטר 'demo') לכתובת האתר.
        // במצב DEMO: אין חיבור ל-Firebase, כל הנתונים ב-localStorage בלבד,
        // ומתאפסים אוטומטית לנתוני seed אחרי שבוע.
        window.IS_DEMO = new URLSearchParams(location.search).has('demo');

        const DEMO_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // שבוע
        const DEMO_KEY = 'synagogue_demo_data';
        const DEMO_EXPIRY_KEY = 'synagogue_demo_expiry';

        function getDemoSeed() {
            return {
                members: [
                    { id: 1, name: 'אהרון הכהן', nickname: 'aron', memberUniqueId: '123', phone: '050-1234567', email: 'aron@example.com' },
                    { id: 2, name: 'משה רבינו', nickname: 'moshe', memberUniqueId: '456', phone: '050-2345678', email: 'moshe@example.com' },
                    { id: 3, name: 'דוד המלך', nickname: 'david', memberUniqueId: '789', phone: '050-3456789', email: 'david@example.com' },
                    { id: 4, name: 'אברהם אבינו', nickname: 'avram', memberUniqueId: '012', phone: '050-4567890', email: 'avram@example.com' }
                ],
                transactions: [
                    { id: 1, memberId: 1, type: 'commitment', commitmentDate: '2026-01-05', purpose: 'תרומה שנתית', commitmentAmount: 1000 },
                    { id: 2, memberId: 1, type: 'payment', paymentDate: '2026-02-01', purpose: 'תרומה שנתית', paymentMethod: 'העברה', reference: '12345', paymentAmount: 500 },
                    { id: 3, memberId: 2, type: 'commitment', commitmentDate: '2026-01-10', purpose: 'עליה לתורה', commitmentAmount: 250 },
                    { id: 4, memberId: 2, type: 'payment', paymentDate: '2026-01-15', purpose: 'עליה לתורה', paymentMethod: 'מזומן', reference: '', paymentAmount: 250 },
                    { id: 5, memberId: 3, type: 'commitment', commitmentDate: '2026-03-01', purpose: 'נדרים', commitmentAmount: 500 },
                    { id: 6, memberId: 4, type: 'commitment', commitmentDate: '2026-03-10', purpose: 'תרומה שנתית', commitmentAmount: 750 },
                    { id: 7, memberId: 4, type: 'payment', paymentDate: '2026-04-01', purpose: 'תרומה שנתית', paymentMethod: 'צ׳ק', reference: '987', paymentAmount: 750 }
                ],
                config: null, // null => ייעשה שימוש בקונפיג ברירת המחדל של האפליקציה
                funds: [],
                paymentPurposes: []
            };
        }

        // טוען (או מאפס אם פג תוקף) את נתוני ה-DEMO ל-localStorage, ומחזיר אותם
        function loadOrResetDemoData() {
            const now = Date.now();
            const expiry = Number(localStorage.getItem(DEMO_EXPIRY_KEY)) || 0;
            let data = null;
            if (expiry && now < expiry) {
                try { data = JSON.parse(localStorage.getItem(DEMO_KEY)); } catch (e) { data = null; }
            }
            if (!data) {
                data = getDemoSeed();
                localStorage.setItem(DEMO_KEY, JSON.stringify(data));
                localStorage.setItem(DEMO_EXPIRY_KEY, String(now + DEMO_EXPIRY_MS));
            }
            return data;
        }

        function saveDemoData(partial) {
            let data = {};
            try { data = JSON.parse(localStorage.getItem(DEMO_KEY)) || {}; } catch (e) { data = {}; }
            Object.assign(data, partial);
            localStorage.setItem(DEMO_KEY, JSON.stringify(data));
        }
        // ===== END DEMO MODE setup =====

        function synagogueApp() {
            return {
                // Authentication
                isLoggedIn: !!localStorage.getItem('authUser'),
                adminEmail: localStorage.getItem('authUser') || '',
                loginForm: { user: '', pass: '' },
                readOnlyMode: false,
                appReady: false,
                appVisible: false,

                // Worshipper phone login (Firebase Phone Auth)
                loginTab: 'worshipper', // 'worshipper' | 'admin'
                authStep: 'phone', // 'phone' | 'code' | 'select'
                worshipperPhone: '',
                otpCode: '',
                confirmationResult: null,
                matchedWorshippers: [], // [{memberUniqueId, name, nickname}]
                worshipperMode: false, // true once a worshipper is viewing their own data
                isAdminPreview: false, // true when an admin is previewing the worshipper view (not a real phone login)
                worshipperMember: null,
                worshipperTransactions: [],
                worshipperMovementColumns: [],
                worshipperLoading: false,

                // קישור/כניסת מנהל בטלפון (OTP) - אופציונלי, נוסף לצד אימייל+סיסמה
                adminLinkPhone: '',
                adminLinkCode: '',
                adminLinkStep: 'phone', // 'phone' | 'code'
                adminLinkConfirmation: null,
                adminLinkedPhone: '',

                // Navigation
                view: 'home',
                activeTab: 'commitments',
                mobileMenuOpen: false,
                sidebarCollapsed: false,

                // Full page table
                fullPageTableOpen: false,
                fullPageTableVisible: false,
                fullPageTableClosing: false,
                fullPageTableTitle: '',
                fullPageTableContext: '',
                fullPageTableScrollMode: false,
                fullPageTable: null,

                // Members
                selectedMember: {},
                editingMember: false,
                memberSearch: '',
                jumpToMemberAfterAdd: true,
                quickAdd: false,
                contactPickerSupported: ('contacts' in navigator && 'ContactsManager' in window),
                nm: { name: '', nickname: '' },

                // Home page
                homeActiveTab: 'commitments',
                homeEntry: {},
                homeFilters: {
                    search: '',
                    type: 'all',
                    period: 'month',
                    fromDate: '',
                    toDate: ''
                },
                lastUsedDate: '', //Used to retrieve the latest date in use, to prevent the user from messing with it
                filteredHomeTransactions: [],
                highlightedRowId: null,
                dbLog: JSON.parse(localStorage.getItem('synagogue_dblog')) || [],
                debtorsTable: null,
                //refresh from db - rotate icon
                isRefreshing: false,
                // Reports
                reportParams: {
                    purpose: '',
                    selectedPurposes: [],
                    fromDate: '',
                    toDate: '',
                    selectedMembers: [],
                    saveName: '',
                    summaryOnly: false,
                    exactMatch: true
                },
                reportMemberSearch: '',
                favoriteReports: JSON.parse(localStorage.getItem('synagogue_favorite_reports')) || [],
                availablePurposes: [],

                // UI State
                darkMode: localStorage.getItem('synagogue_dark_mode') === 'true',
                ui: {
                    synagogueOpen: true,
                    backupOpen: true,
                    debtorsCollapsed: true,
                    homeCollapsed: true,

                    obOpen: false,
                    payOpen: false,
                    movOpen: false,
                    fieldsOpen: false,
                    adminPhoneOpen: false,
                    googleDriveOpen: false,
                    homeSearchOpen: false,
                    homeAddOpen: false,
                    batchAddOpen: false,
                    batchTxOpen: false,
                    restoreOpen: false,
                    googleDriveBackupOpen: true,
                    filteredExportOpen: false,
                    importOpen: false,
                    reportsParamsCollapsed: true,
                    aboutOpen: false, // ברירת מחדל: מוסתר
                },
                // Search strings for tables
                debtorsSearch: '',
                homeSearch: '',
                membersSearch: '',
                summarySearch: '',
                // Import/Export state
                ieFilters: { type: 'all', memberId: '', fromDate: '', toDate: '' },
                ieImportTab: 'json',
                ieBatchText: '',
                tableScrollMode: false,
                // Per-table scroll modes (persisted in config)
                get tableScrollModes() {
                    return this.config.tableScrollModes || {};
                },
                getTableScroll(tableId) {
                    return !!(this.config.tableScrollModes && this.config.tableScrollModes[tableId]);
                },
                toggleTableScroll(tableId) {
                    if (!this.config.tableScrollModes) this.config.tableScrollModes = {};
                    this.config.tableScrollModes[tableId] = !this.config.tableScrollModes[tableId];
                    this.tableScrollMode = this.config.tableScrollModes[tableId];
                    this.saveConfigData();
                },
                batchString: '',
                batchTxString: '',
                batchTxType: 'commitments',
                batchActiveToken: 0,
                backupPreviewText: null,
                backupPreviewFilename: '',
                backupHistory: [],
                restoreHistory: [],
                reportColumnDefs: [
                    { field: 'memberName', title: 'מתפלל', visible: true },
                    { field: 'date', title: 'תאריך', visible: true },
                    { field: 'typeLabel', title: 'סוג', visible: true },
                    { field: 'purpose', title: 'מטרה', visible: true },
                    { field: 'details', title: 'פרטים', visible: true },
                    { field: 'amount', title: 'סכום', visible: true }
                ],
                summaryColorMode: true,

                // ═══ kupot - FUNDS ═══
                funds: [],
                selectedFund: null,
                newFundName: '',
                newFundNotes: '',
                fundEditingId: null,
                fundEditingName: '',
                fundEditingNotes: '',
                showAddFundForm: false,

                // ═══ payment purposes - מטרות תשלום (רשימה גלובלית, משותפת לכל הקופות) ═══
                paymentPurposes: [],
                selectedPurpose: null,
                newPurposeName: '',
                newPurposeStartDate: '',
                newPurposeNotes: '',
                purposeEditingId: null,
                showAddPurposeForm: false,
                purposeEditingName: '',
                purposeEditingNotes: '',
                purposeEditingStartDate: '',
                purposeRangeFrom: '',
                purposeRangeTo: '',

                // Google Drive backup integration
                // הדבק כאן פעם אחת את ה-Client ID המרכזי שלך (xxxx.apps.googleusercontent.com) - כל בתי הכנסת ישתמשו בו בלחיצה אחת
                defaultGoogleClientId: '300451630668-ve7ohupjgtrjklc2gdr9ulbcaljsfsfm.apps.googleusercontent.com',
                //old: '300451630668-h9evrtgafhq3q5a6ubjor6oehuh0l8au.apps.googleusercontent.com',
				//---google drive compatability settings
				//Advanced Drive settings (custom Client ID / ID in use) are displayed only to the developer: add ?dev=1 to the URL. 
				// If the site lacks a built-in Client ID, always display them; otherwise, connection is impossible.
                get showAdvancedDriveSettings() {
                    try { if (new URLSearchParams(location.search).has('dev')) return true; } catch (e) { }
                    return !this.defaultGoogleClientId;
                },
				//
                get effectiveGoogleClientId() {
                    const custom = (this.config?.googleDrive?.clientId || '').replace(/[\s'"]/g, '');
                    const valid = /^\d{6,}-[a-z0-9]{20,}\.apps\.googleusercontent\.com$/i.test(custom);
                    return valid ? custom : this.defaultGoogleClientId;
                },
                googleDriveConnected: false,
                googleDriveConnecting: false,
                googleDriveAccessToken: '',
                googleDriveTokenClient: null,
                googleDriveFiles: [],
                googleDriveLoadingFiles: false,
                googleDriveBackingUp: false,
                googleDriveUserEmail: '',
                _gisLoaded: false,
                googleDriveNeedsClick: false,   // חיבור קיים בחשבון, אך במכשיר הזה נדרשת לחיצה אחת להפעלה
                _driveTokenExpiry: 0,
                _drivePending: null,
                _driveClientIdUsed: '',
                _driveAutoTried: false,

                // Print sessions
                printSessions: JSON.parse(localStorage.getItem('synagogue_print_sessions')) || [],

                // Configuration
                // הערה: אין לטעון קונפיגורציה מ-localStorage. המקור היחיד לאמת הוא Firestore
                // (או נתוני הדגמה במצב DEMO). כך גם נמנעת בעיה של נתונים ישנים/פגומים ב-localStorage
                // שגורמים לטבלאות "להיעלם" עד לרענון קשה של הדפדפן.
                config:
                {
                    googleDrive: {
                        clientId: '',
                        folderId: '',
                        folderName: 'גיבויי בית הכנסת'
                    },
                    commitmentColumns: [
                        { columnId: 'ob_date', title: 'תאריך', field: 'commitmentDate', type: 'date', fixed: true },
                        { columnId: 'ob_purpose', title: 'מטרת תשלום', field: 'purpose', type: 'list', options: 'תרומה שנתית,תרומה חודשית,עליה לתורה,הנצחה,אחר', fixed: true },
                        { columnId: 'ob_amount', title: 'סכום', field: 'commitmentAmount', type: 'money', fixed: true }
                    ],
                    paymentColumns: [
                        { columnId: 'pay_date', title: 'תאריך', field: 'paymentDate', type: 'date', fixed: true },
                        { columnId: 'pay_purpose', title: 'מטרת תשלום', field: 'purpose', type: 'text', fixed: false },
                        { columnId: 'pay_method', title: 'אופן תשלום', field: 'paymentMethod', type: 'list', options: 'מזומן,העברה,צ׳ק,אשראי', fixed: false },
                        { columnId: 'pay_reference', title: 'אסמכתא', field: 'reference', type: 'text', fixed: false },
                        { columnId: 'pay_amount', title: 'סכום', field: 'paymentAmount', type: 'money', fixed: true }
                    ],
                    movementColumns: [
                        { columnId: 'mov_date', title: 'תאריך', field: 'date', type: 'date', fixed: true },
                        { columnId: 'mov_commitmentAmount', title: 'סכום התחייבות', field: 'commitmentAmount', type: 'money', fixed: true },
                        { columnId: 'mov_paymentAmount', title: 'תשלום בפועל', field: 'paymentAmount', type: 'money', fixed: true },
                        { columnId: 'mov_paymentType', title: 'סוג תשלום', field: 'paymentType', type: 'text', fixed: false },
                        { columnId: 'mov_reference', title: 'אסמכתא', field: 'reference', type: 'text', fixed: false }
                    ],
                    memberFields: [
                        { fieldId: 'field_name', name: 'שם מלא', key: 'name', required: true },
                        { fieldId: 'field_nickname', name: 'כינוי', key: 'memberUniqueId', required: true },
                        { fieldId: 'field_phone', name: 'טלפון', key: 'phone', required: false },
                        { fieldId: 'field_email', name: 'אימייל', key: 'email', required: false }
                    ],
                    theme: {
                        primary: '#2c5f7d', bg: '#f8f9fa',
                        sidebarBg: '#ffffff', sidebarFont: '#212529',
                        cardBg: '#ffffff', cardFont: '#212529',
                        tableBg: '#ffffff', tableHeaderBg: '#f8f9fa', tableFont: '#212529',
                        primaryDark: '#4a9eff', bgDark: '#1a1d23',
                        sidebarBgDark: '#25292f', sidebarFontDark: '#e4e6eb',
                        cardBgDark: '#25292f', cardFontDark: '#e4e6eb',
                        tableBgDark: '#25292f', tableHeaderBgDark: '#1a1d23', tableFontDark: '#e4e6eb'
                    },
                    synagogueName: '',
                    synagogueLogo: '',
                    tableScrollModes: {}
                },

                // Data
                // אין לטעון נתוני מתפללים/תנועות מ-localStorage בשום מצב — רק מ-Firestore (או seed בדמו).
                members: [],
                transactions: [],
                dataLoaded: false,
                newEntry: {},
                currentTable: null,

                // Batch IntelliSense state (managed directly in DOM now — see _batchPopupItems/_batchActiveIdx)
                _batchPopupItems: [],
                _batchActiveIdx: -1,

                get batchPlaceholder() {
                    const cols = this.batchTxType === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    const names = cols.map(c => c.title).join(', ');
                    return `ישראל ישראלי, ${names}`;
                },

                get customStyle() {
                    const isDark = this.darkMode;
                    const colors = [];
                    return `
                        --primary-color: ${isDark ? this.config.theme.primaryDark : this.config.theme.primary};
                        --bg-main: ${isDark ? this.config.theme.bgDark : this.config.theme.bg};
                        --bg-secondary: ${isDark ? this.config.theme.cardBgDark : this.config.theme.cardBg};
                        --sidebar-bg: ${isDark ? this.config.theme.sidebarBgDark : this.config.theme.sidebarBg};
                        --text-primary: ${isDark ? this.config.theme.cardFontDark : this.config.theme.cardFont};
                        --card-bg: ${isDark ? this.config.theme.cardBgDark : this.config.theme.cardBg};
                        --card-font: ${isDark ? this.config.theme.cardFontDark : this.config.theme.cardFont};
                        --table-bg: ${isDark ? this.config.theme.tableBgDark : this.config.theme.tableBg};
                        --table-header-bg: ${isDark ? this.config.theme.tableHeaderBgDark : this.config.theme.tableHeaderBg};
                        --table-font: ${isDark ? this.config.theme.tableFontDark : this.config.theme.tableFont};
                    `;
                },

                init() {
                    // ניקוי חד-פעמי: מחיקת נתוני מתפללים/תנועות/קונפיגורציה שנשמרו בגרסאות קודמות
                    // של האפליקציה ב-localStorage. במצב אמיתי (לא הדגמה) אסור שיישאר שום נתון כזה בדפדפן.
                    if (!window.IS_DEMO) {
                        ['synagogue_members', 'synagogue_transactions', 'synagogue_config', 'synagogue_funds'].forEach(k => localStorage.removeItem(k));
                    }

                    this.isLoggedIn = !!localStorage.getItem('authUser');
                    this.appReady = true;

                    // page fade in
                    setTimeout(() => {
                        this.appVisible = true;
                    }, 20);


                    const params = new URLSearchParams(window.location.hash.substring(1));

                    // קישור ישיר למתפלל: תומך גם ב-?phone=... וגם ב-#phone=...
                    // בפתיחת קישור כזה, ממלאים את הטלפון ושולחים קוד אימות אוטומטית
                    const queryParams = new URLSearchParams(window.location.search);
                    const linkPhone = params.get('phone') || queryParams.get('phone');
                    if (linkPhone && !window.IS_DEMO) {
                        this.worshipperPhone = linkPhone;
                        this.loginTab = 'worshipper';
                        this.authStep = 'phone';
                        setTimeout(() => { this.sendOtpCode(); }, 600);
                    }

                    this.resetEntry();
                    this.resetHomeEntry();

                    if (!this.config.synagogueName && this.config.synagogueName !== '') this.config.synagogueName = '';
                    if (!this.config.synagogueLogo && this.config.synagogueLogo !== '') this.config.synagogueLogo = '';
                    this.updatePageTitle();

                    if (!this.config.movementColumns) {
                        this.config.movementColumns = [
                            { columnId: 'mov_date', title: 'תאריך', field: 'date', type: 'date', fixed: true },
                            { columnId: 'mov_commitmentAmount', title: 'סכום התחייבות', field: 'commitmentAmount', type: 'money', fixed: true },
                            { columnId: 'mov_paymentAmount', title: 'תשלום בפועל', field: 'paymentAmount', type: 'money', fixed: true },
                            { columnId: 'mov_paymentType', title: 'סוג תשלום', field: 'paymentType', type: 'text', fixed: false },
                            { columnId: 'mov_reference', title: 'אסמכתא', field: 'reference', type: 'text', fixed: false }
                        ];
                        // לא שומרים כאן: ברירות המחדל לא יכולות לדרוס הגדרות קיימות שעוד לא נטענו מהמסד
                    }

                    this.handleRouting();
                    this.extractAvailablePurposes();
                    this.setDefaultReportDates();

                    let _cfgSaveTimer = null;
                    this.$watch('config', () => {
                        this.renderTable();
                        // אל תשמור בזמן טעינה מהמסד; אחרת מאחדים שמירות רצופות לשמירה אחת
                        if (this._suppressConfigSave) return;
                        clearTimeout(_cfgSaveTimer);
                        _cfgSaveTimer = setTimeout(() => this.saveConfigData(), 400);
                    }, { deep: true });

                    // הפעלה בעת גלילת החלון
                    window.addEventListener('scroll', () => {
                        // const headerCard = document.querySelector('.worshipper-header-sticky');
                        const headerCard = document.querySelector('.member-header-card');
                        if (headerCard) {
                            if (window.scrollY > 40) {
                                headerCard.classList.add('is-stuck');
                            } else {
                                headerCard.classList.remove('is-stuck');
                            }
                        }
                    });

                    /** Key Shortcuts*/
                    window.addEventListener('keydown', (e) => {
                        if (!this.isLoggedIn) return;
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            const searchInput = document.getElementById('memberSearch');
                            if (searchInput) searchInput.focus();
                        }
                        if (e.altKey && (e.key === 'h' || e.key === 'י')) { e.preventDefault(); this.navigate('home'); }
                        if (e.altKey && (e.key === 'g' || e.key === 'ע')) { e.preventDefault(); this.navigate('management'); }
                        if (e.altKey && (e.key === 'r' || e.key === 'ר')) { e.preventDefault(); this.navigate('reports'); }
                        if (e.altKey && (e.key === 's' || e.key === 'ד')) { e.preventDefault(); this.navigate('summary'); }
                        if (e.altKey && (e.key === 'b' || e.key === 'נ')) { e.preventDefault(); this.navigate('importexport'); }
                        if (e.altKey && (e.key === 'c' || e.key === 'ב')) { e.preventDefault(); this.navigate('funds'); }
                        if (e.altKey && e.key === '1') { e.preventDefault(); this.setTab('movements'); }
                        if (e.altKey && e.key === '2') { e.preventDefault(); this.setTab('commitments'); }
                        if (e.altKey && e.key === '3') { e.preventDefault(); this.setTab('payments'); }
                        if (e.altKey && e.key === '4') { e.preventDefault(); this.setTab('edit'); }
                    });

                    window.addEventListener('hashchange', () => this.handleRouting());

                    // ===== DEMO MODE: דילוג מוחלט על Firebase, טעינת נתוני seed =====
                    document.title = window.IS_DEMO ? "ניהול בית הכנסת - מצב הדגמה" : document.title;
                    if (window.IS_DEMO) {
                        this.isLoggedIn = true;
                        this.adminEmail = 'מנהל הדגמה';
                        const demoData = loadOrResetDemoData();
                        this.members = demoData.members || [];
                        this.transactions = demoData.transactions || [];
                        this.funds = demoData.funds || [];
                        this.paymentPurposes = demoData.paymentPurposes || [];
                        if (demoData.config) this.config = { ...this.config, ...demoData.config };
                        if (demoData.backupMeta) {
                            this.backupHistory = demoData.backupMeta.backups || [];
                            this.restoreHistory = demoData.backupMeta.restores || [];
                        }
                        this.dataLoaded = true;
                        this.extractAvailablePurposes();
                        this.handleRouting(); // <--- 2. רק עכשיו מפעילים את הראוטינג (כשיש מתפללים בזיכרון לחפש לפיהם!)
                        setTimeout(() => this.renderTable(), 100);
                        return;
                    }
                    // ===== END DEMO MODE =====

                    // Wait for Firebase to be ready, then listen to auth state
                    const waitForFirebase = (attempts = 0) => {
                        if (window.auth && window.fsMethods) {
                            window.fsMethods.onAuthStateChanged(window.auth, async (user) => {
                                // חשבון מתפלל (Phone Auth) - יש לו phoneNumber ואין לו email.
                                // אלה נתוני מתפלל בלבד, נטענים דרך getMemberData/listMyMembers
                                // (ראה verifyOtpCode/selectWorshipperAccount) ולא דרך _loadFromFirestore,
                                // ואסור שחשבון כזה ייכנס למצב מנהל (isLoggedIn).
                                if (user && user.phoneNumber && !user.email) {
                                    this.isLoggedIn = false;
                                    return;
                                }
                                if (user) {
                                    // ניסיונות חוזרים אוטומטיים: חיבור ראשוני למסד לעיתים איטי ונכשל בניסיון הראשון
                                    let _loadOk = false;
                                    for (let attempt = 0; attempt < 4 && !_loadOk; attempt++) {
                                        try { await this._loadFromFirestore(); _loadOk = true; }
                                        catch (e) { await new Promise(r => setTimeout(r, 500 * (attempt + 1))); }
                                    }
                                    if (!_loadOk) {
                                        Swal.fire({ icon: 'error', title: 'שגיאה בחיבור לבסיס הנתונים', text: 'לא ניתן היה לטעון את הנתונים. שמירת שינויים חסומה עד לטעינה מוצלחת כדי לא לדרוס נתונים. לחץ על כפתור הרענון לניסיון נוסף.' });
                                    }
                                    this.isLoggedIn = true;
                                    this.adminEmail = user.email || localStorage.getItem('authUser') || '';
                                    this.adminLinkedPhone = user.phoneNumber || '';
                                    this.extractAvailablePurposes();
                                    this.handleRouting(); // <--- 2. רק עכשיו מפעילים את הראוטינג (כשיש מתפללים בזיכרון לחפש לפיהם!)

                                    setTimeout(() => this.renderTable(), 100);

                                    // חיבור אוטומטי לגוגל דרייב ברקע (לא חוסם את הטעינה): אם הדרייב כבר חובר מכל מכשיר, מחברים גם כאן
                                    if (_loadOk) this.autoReconnectGoogleDrive();
                                } else {
                                    this.isLoggedIn = false;
                                }
                            });
                        } else if (attempts < 600) {
                            setTimeout(() => waitForFirebase(attempts + 1), 50);
                        } else {
                            Swal.fire({ icon: 'error', title: 'שגיאה בחיבור לבסיס הנתונים', text: 'ספריות Firebase לא נטענו. בדוק את חיבור האינטרנט ורענן את הדף.' });
                        }
                    };
                    waitForFirebase();
                },
                formatWhatsappLink(phone) {
                    if (!phone) return '#';
                    // clear if not number
                    let cleanPhone = phone.replace(/\D/g, '');

                    // replace starting 0 with 972
                    if (cleanPhone.startsWith('0')) {
                        cleanPhone = '972' + cleanPhone.substring(1);
                    }

                    return `https://wa.me/${cleanPhone}`;
                },
                getMovementColumns() {
                    const allCols = [
                        ...this.config.commitmentColumns.map(c => ({ ...c, source: 'commitments' })),
                        ...this.config.paymentColumns.map(c => ({ ...c, source: 'payments' }))
                    ];

                    // הסרת כפילויות לפי field
                    const map = {};
                    allCols.forEach(col => {
                        if (!map[col.field]) {
                            map[col.field] = col;
                        }
                    });

                    return Object.values(map);
                },
                movementColumnVisibility: {},
                isMovementColumnVisible(field) {
                    return this.movementColumnVisibility[field] !== false;
                },


                getTodayDate() { return new Date().toISOString().split('T')[0]; },
                escapeHtml(str) {
                    return String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                },

                handleRouting() {
                    const hash = window.location.hash.substring(1);
                    const params = new URLSearchParams(hash);
                    if (params.get('view')) this.view = params.get('view');
                    if (params.get('member')) {
                        const memberId = params.get('member');
                        this.selectedMember = this.members.find(m => m.memberUniqueId == memberId);
                    }
                    if (params.get('tab')) this.activeTab = params.get('tab');
                    if (params.get('highlight')) this.highlightedRowId = params.get('highlight');
                    setTimeout(() => this.renderTable(), 100);
                },

                updateURL() {
                    let params = new URLSearchParams();
                    if (this.view !== 'home') params.set('view', this.view);
                    if (this.selectedMember && this.view === 'account') {
                        params.set('member', this.selectedMember.memberUniqueId);
                        params.set('tab', this.activeTab);
                    }
                    window.location.hash = params.toString();
                },

                navigate(v) {
                    this.view = v;
                    if (v === 'home') { window.location.hash = ''; }
                    else this.updateURL();
                    setTimeout(() => this.renderTable(), 50);
                },

                setTab(tab_name) {
                    this.activeTab = tab_name;
                    this.updateURL();
                    setTimeout(() => {
                        this.renderTable();
                        if (['commitments', 'payments'].includes(tab_name)) {
                            setTimeout(() => {
                                this._attachNewEntryEnterNav();

                                // Auto scroll down in mobile mode
                                if (window.innerWidth < 992) {
                                    const formEl = document.getElementById('newEntryForm');
                                    if (formEl) {
                                        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }
                            }, 150);
                        }
                    }, 50);
                },

                selectMember(m) {
                    this.selectedMember = m;
                    // אם כבר צופים בכרטיס מתפלל (ריכוז תנועות/התחייבויות/תשלומים/עריכת פרטים) —
                    // נשארים על אותה לשונית עבור המתפלל החדש. רק בכניסה ראשונה לכרטיס מתפלל
                    // (מדף אחר) פותחים בברירת המחדל "ריכוז תנועות".
                    if (this.view !== 'account' || !this.activeTab) {
                        this.activeTab = 'movements';
                    }
                    this.view = 'account';
                    this.updateURL();
                    this.renderTable();
                },

                goToMemberTransaction(memberId, transactionId) {
                    const member = this.members.find(m => m.memberUniqueId === memberId);
                    if (!member) return;
                    this.selectedMember = member;
                    this.view = 'account';
                    const transaction = this.transactions.find(t => t.transactionId === transactionId);
                    this.activeTab = transaction ? transaction.transactionType : 'commitments';
                    this.highlightedRowId = transactionId;
                    let params = new URLSearchParams();
                    params.set('view', 'account');
                    params.set('member', memberId);
                    params.set('tab', this.activeTab);
                    params.set('highlight', transactionId);
                    window.location.hash = params.toString();
                    setTimeout(() => { this.renderTable(); }, 100);
                },

                goToMemberTransactionInTab(transactionId, tab) {
                    this.activeTab = tab;
                    this.highlightedRowId = transactionId;
                    this.updateURL();
                    setTimeout(() => {
                        this.renderTable();
                        setTimeout(() => {
                            const row = document.querySelector(`[data-transaction-id="${transactionId}"]`);
                            if (row) {
                                row.classList.add('highlight-row');
                                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            this.highlightedRowId = null;
                        }, 350);
                    }, 100);
                },

                // Full Page Table
                openFullPageTable(context) {
                    this.fullPageTableContext = context;
                    this.fullPageTableOpen = true;
                    this.fullPageTableClosing = false;
                    const titles = { home: 'תנועות אחרונות', account: this.selectedMember?.name || 'חשבון', movements: 'ריכוז תנועות', summary: 'סיכום חובות', debtors: 'מתפללים ביתרת חובה' };
                    this.fullPageTableTitle = titles[context] || '';
                    this.$nextTick(() => {
                        requestAnimationFrame(() => {
                            this.fullPageTableVisible = true;
                            this.renderFullPageTable();
                        });
                    });
                },

                closeFullPageTable() {
                    this.fullPageTableClosing = true;
                    this.fullPageTableVisible = false;
                    setTimeout(() => {
                        this.fullPageTableOpen = false;
                        this.fullPageTableClosing = false;
                        if (this.fullPageTable) { try { this.fullPageTable.destroy(); } catch (e) { } this.fullPageTable = null; }
                    }, 240);
                },

                renderFullPageTable() {
                    if (this.fullPageTable) { try { this.fullPageTable.destroy(); } catch (e) { } this.fullPageTable = null; }
                    const container = document.getElementById('fullpageTableContainer');
                    if (!container) return;
                    container.innerHTML = '<div id="fullpageTabulator"></div>';

                    const ctx = this.fullPageTableContext;
                    let data = [];
                    let columns = [];

                    if (ctx === 'home' || ctx === 'account' || ctx === 'movements') {
                        // Reuse current table data
                        if (this.currentTable) {
                            data = this.currentTable.getData();
                            columns = this.currentTable.getColumns().map(col => {
                                const def = col.getDefinition();
                                return { ...def };
                            });
                        }
                    } else if (ctx === 'debtors') {
                        if (this.debtorsTable) {
                            data = this.debtorsTable.getData();
                            columns = this.debtorsTable.getColumns().map(col => ({ ...col.getDefinition() }));
                        }
                    } else if (ctx === 'summary') {
                        if (this.currentTable) {
                            data = this.currentTable.getData();
                            columns = this.currentTable.getColumns().map(col => ({ ...col.getDefinition() }));
                        }
                    }

                    this.fullPageTable = new Tabulator("#fullpageTabulator", {
                        data,
                        layout: this.fullPageTableScrollMode ? "fitData" : "fitColumns",
                        responsiveLayout: false,
                        pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200],
                        columns,
                        height: "calc(100vh - 140px)",
                        cellEdited: (cell) => {
                            if (!this.readOnlyMode)
                                this.saveTransactionsData();
                            const el = cell.getRow().getElement();
                            el.classList.remove('row-saved-flash');
                            void el.offsetWidth;
                            el.classList.add('row-saved-flash');
                            setTimeout(() => el.classList.remove('row-saved-flash'), 2400);
                        }
                    });
                },

                fullPageAddRow() {
                    if (this.fullPageTable) {
                        this.fullPageTable.addRow({}, true);
                    }
                },

                // Authentication
                async login() {
                    // ===== DEMO MODE: כניסה אוטומטית, אין Firebase =====
                    if (window.IS_DEMO) {
                        this.isLoggedIn = true;
                        this.adminEmail = 'מנהל הדגמה';
                        return;
                    }
                    // ===== END DEMO MODE =====
                    if (!window.auth || !window.fsMethods) {
                        Swal.fire({ icon: 'error', title: 'שגיאה', text: 'Firebase לא מוכן, נסה שוב בעוד שנייה', timer: 2500, showConfirmButton: false });
                        return;
                    }
                    try {
                        await window.fsMethods.signInWithEmailAndPassword(window.auth, this.loginForm.user, this.loginForm.pass);

                        // Only if we got here - the log in was successful!
                        this.isLoggedIn = true;
                        this.adminEmail = this.loginForm.user;
                        localStorage.setItem('authUser', this.loginForm.user);
                        //reset password field
                        this.loginForm.pass = '';
                        Swal.fire({ icon: 'success', title: 'ברוך הבא ' + this.loginForm.user, timer: 1500, showConfirmButton: false });
                    } catch (err) {
                        const msgs = {
                            'auth/invalid-email': 'כתובת האימייל אינה תקינה',
                            'auth/user-not-found': 'משתמש לא נמצא',
                            'auth/wrong-password': 'סיסמה שגויה',
                            'auth/invalid-credential': 'שם משתמש או סיסמה שגויים',
                            'auth/too-many-requests': 'יותר מדי ניסיונות, נסה שוב מאוחר יותר'
                        };
                        Swal.fire({ icon: 'error', title: 'שגיאת כניסה', text: msgs[err.code] || 'שם משתמש או סיסמה שגויים', timer: 3000, showConfirmButton: false });

                        // Make sure that isLoggedIn stays false
                        this.isLoggedIn = false;
                    }
                },

                async logout() {
                    // ===== DEMO MODE: לא מתנתקים בפועל, נשארים מחוברים כ"מנהל דמו" =====
                    if (window.IS_DEMO) {
                        Swal.fire({ icon: 'info', title: 'מצב הדגמה', text: 'במצב הדגמה לא ניתן להתנתק', timer: 2000, showConfirmButton: false });
                        return;
                    }
                    // ===== END DEMO MODE =====
                    this._clearDriveSession();   // טוקן הדרייב לא נשאר בדפדפן אחרי יציאה
                    if (window.auth)
                        await window.auth.signOut();
                    this.isLoggedIn = false;
                    window.location.hash = '';
                    localStorage.removeItem('authUser');

                },

                // ═══════════════════════════════════════════════════════════════
                // כניסת מתפלל - Firebase Phone Auth (OTP ב-SMS)
                // ═══════════════════════════════════════════════════════════════

                // נרמול מספר טלפון לפורמט בינלאומי E.164 (0501234567 -> +972501234567)
                formatPhoneE164(rawPhone) {
                    let cleaned = String(rawPhone || '').replace(/\D/g, '');
                    if (cleaned.startsWith('0')) cleaned = '972' + cleaned.substring(1);
                    if (!cleaned.startsWith('972')) cleaned = '972' + cleaned;
                    return '+' + cleaned;
                },

                async sendOtpCode() {
                    const digits = String(this.worshipperPhone || '').replace(/\D/g, '');
                    if (digits.length < 9 || digits.length > 10) {
                        Swal.fire('שגיאה', 'נא להזין מספר טלפון תקין', 'error');
                        return;
                    }
                    if (!window.auth || !window.fsMethods) {
                        Swal.fire('שגיאה', 'המערכת עדיין נטענת, נסה שוב בעוד רגע', 'error');
                        return;
                    }
                    const phoneFormatted = this.formatPhoneE164(digits);
                    try {
                        if (!window.recaptchaVerifier) {
                            window.recaptchaVerifier = new window.fsMethods.RecaptchaVerifier(
                                window.auth, 'recaptcha-container', { size: 'invisible' }
                            );
                        }
                        Swal.fire({ title: 'שולח קוד אימות...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                        const confirmation = await window.fsMethods.signInWithPhoneNumber(
                            window.auth, phoneFormatted, window.recaptchaVerifier
                        );
                        this.confirmationResult = confirmation;
                        Swal.close();
                        this.authStep = 'code';
                    } catch (err) {
                        console.error('sendOtpCode error:', err);
                        Swal.close();
                        // מאפסים את ה-reCAPTCHA כדי לאפשר ניסיון נוסף
                        if (window.recaptchaVerifier) {
                            try { window.recaptchaVerifier.clear(); } catch (e) { }
                            window.recaptchaVerifier = null;
                        }
                        const msgs = {
                            'auth/invalid-phone-number': 'מספר הטלפון אינו תקין',
                            'auth/too-many-requests': 'יותר מדי בקשות, נסה שוב מאוחר יותר',
                            'auth/quota-exceeded': 'חריגה ממכסת ה-SMS היומית, נסה שוב מחר או פנה לגבאי'
                        };
                        Swal.fire('שגיאה בשליחת הקוד', msgs[err.code] || err.message || 'נסה שוב', 'error');
                    }
                },

                async verifyOtpCode() {
                    if (!this.otpCode || this.otpCode.length !== 6) {
                        Swal.fire('שגיאה', 'נא להזין קוד אימות בן 6 ספרות', 'error');
                        return;
                    }

                    // שלב א': אימות הקוד מול Firebase Auth
                    Swal.fire({ title: 'מאמת קוד...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                    try {
                        await this.confirmationResult.confirm(this.otpCode);
                    } catch (err) {
                        console.error('confirm() error:', err.code, err.message);
                        Swal.close();
                        Swal.fire('שגיאה', 'קוד אימות שגוי או שפג תוקפו, נסה שוב', 'error');
                        return;
                    }

                    // אם למספר הטלפון הזה כבר מקושר חשבון מנהל (יש email על החשבון
                    // שהתחבר), זו לא כניסת מתפלל - onAuthStateChanged כבר יטען את חשבון
                    // המנהל המלא בעצמו, אין צורך בכלום מכאן ואילך.
                    if (window.auth.currentUser && window.auth.currentUser.email) {
                        Swal.close();
                        return;
                    }

                    // שלב ב': המשתמש כבר מחובר בהצלחה ל-Firebase Auth בשלב הזה.
                    // כל שגיאה מכאן ואילך היא לא "קוד שגוי" - היא בעיה בקריאה לשרת
                    // (פונקציה לא פרוסה, config/singleton חסר וכו') ומוצגת בנפרד כדי
                    // שאפשר יהיה לאבחן אותה.
                    try {
                        const listMyMembers = window.fsMethods.httpsCallable(window.functions, 'listMyMembers');
                        const result = await listMyMembers();
                        Swal.close();
                        const members = (result.data && result.data.members) || [];
                        if (members.length === 0) {
                            Swal.fire('לא נמצא חשבון', 'מספר הטלפון לא נמצא במערכת בית הכנסת. פנה לגבאי.', 'warning');
                            await window.fsMethods.signOut(window.auth);
                            return;
                        }
                        this.matchedWorshippers = members;
                        if (members.length === 1) {
                            await this.selectWorshipperAccount(members[0]);
                        } else {
                            this.authStep = 'select';
                        }
                    } catch (err) {
                        console.error('listMyMembers error:', err.code, err.message);
                        Swal.close();
                        Swal.fire(
                            'האימות הצליח, אך טעינת הנתונים נכשלה',
                            `קוד: ${err.code || 'לא ידוע'}\n${err.message || ''}`,
                            'error'
                        );
                    }
                },

                // בחירת/מעבר לחשבון מתפלל - טוענת מהשרת רק את הנתונים שלו
                async selectWorshipperAccount(member) {
                    this.worshipperLoading = true;
                    this.worshipperMode = true;
                    try {
                        const getMemberData = window.fsMethods.httpsCallable(window.functions, 'getMemberData');
                        const result = await getMemberData({ memberUniqueId: member.memberUniqueId });
                        this.worshipperMember = result.data.member;
                        this.worshipperTransactions = result.data.transactions || [];
                        this.worshipperMovementColumns = result.data.movementColumns || this.defaultMovementColumns();
                        this.authStep = 'phone';
                        this.otpCode = '';
                    } catch (err) {
                        console.error('selectWorshipperAccount error:', err);
                        Swal.fire('שגיאה', 'לא ניתן לטעון את הנתונים כרגע, נסה שוב', 'error');
                    } finally {
                        this.worshipperLoading = false;
                    }
                },

                defaultMovementColumns() {
                    return [
                        { columnId: 'mov_date', title: 'תאריך', field: 'date', type: 'date', fixed: true },
                        { columnId: 'mov_commitmentAmount', title: 'סכום התחייבות', field: 'commitmentAmount', type: 'money', fixed: true },
                        { columnId: 'mov_paymentAmount', title: 'תשלום בפועל', field: 'paymentAmount', type: 'money', fixed: true },
                        { columnId: 'mov_paymentType', title: 'סוג תשלום', field: 'paymentType', type: 'text', fixed: false },
                        { columnId: 'mov_reference', title: 'אסמכתא', field: 'reference', type: 'text', fixed: false }
                    ];
                },

                // הופך תנועה גולמית לשורת "ריכוז תנועות" - אותה לוגיקה בדיוק כמו
                // renderMovementsTable, כדי שתצוגת המתפלל תהיה זהה למה שהמנהל רואה
                toMovementRow(t) {
                    const oblAmt = Number(t.commitmentAmount) || 0;
                    const payAmt = Number(t.paymentAmount) || 0;
                    return {
                        transactionId: t.transactionId,
                        transactionType: t.transactionType,
                        date: t.commitmentDate || t.paymentDate || '',
                        purpose: t.purpose || '',
                        paymentType: t.paymentMethod || '',
                        reference: t.reference || '',
                        commitmentAmount: oblAmt,
                        paymentAmount: payAmt,
                        difference: oblAmt - payAmt
                    };
                },

                // ערך תא בודד בטבלת המתפלל, לפי הגדרת העמודה (title/field/type)
                getWorshipperCellValue(t, col) {
                    if (col.field === 'date') return formatDate(t.date);
                    const val = t[col.field];
                    if (col.type === 'money') {
                        return (val === undefined || val === null || val === '' || Number(val) === 0) ? '' : Number(val).toLocaleString();
                    }
                    return val || '';
                },

                getWorshipperBalance() {
                    return this.worshipperTransactions.reduce((sum, t) => {
                        if (t.transactionType === 'commitments') return sum + (Number(t.commitmentAmount) || 0);
                        if (t.transactionType === 'payments') return sum - (Number(t.paymentAmount) || 0);
                        return sum;
                    }, 0);
                },

                async worshipperLogout() {
                    if (window.auth && window.fsMethods) {
                        try { await window.fsMethods.signOut(window.auth); } catch (e) { }
                    }
                    this.worshipperMode = false;
                    this.worshipperMember = null;
                    this.worshipperTransactions = [];
                    this.worshipperMovementColumns = [];
                    this.matchedWorshippers = [];
                    this.worshipperPhone = '';
                    this.otpCode = '';
                    this.authStep = 'phone';
                    window.location.hash = '';
                    window.history.replaceState(null, '', window.location.pathname);
                },

                // ═══════════════════════════════════════════════════════════════
                // קישור טלפון לחשבון מנהל - מאפשר להיכנס עם קוד SMS במקום סיסמה.
                // משתמש ב-linkWithCredential כדי לחבר את מספר הטלפון לאותו חשבון
                // Firebase Auth (אותו UID!) שכבר מחובר עם אימייל/סיסמה - כך שהכניסה
                // הבאה עם אותו טלפון תיכנס ישירות לאותו חשבון מנהל, בלי שום שינוי
                // בהרשאות/בנתיבי הנתונים.
                // ═══════════════════════════════════════════════════════════════
                async sendAdminPhoneLinkOtp() {
                    const digits = String(this.adminLinkPhone || '').replace(/\D/g, '');
                    if (digits.length < 9 || digits.length > 10) {
                        Swal.fire('שגיאה', 'נא להזין מספר טלפון תקין', 'error');
                        return;
                    }
                    if (!window.auth.currentUser) {
                        Swal.fire('שגיאה', 'יש להיות מחוברים כמנהל כדי לקשר טלפון', 'error');
                        return;
                    }
                    const phoneFormatted = this.formatPhoneE164(digits);
                    try {
                        if (!window.adminLinkRecaptchaVerifier) {
                            window.adminLinkRecaptchaVerifier = new window.fsMethods.RecaptchaVerifier(
                                window.auth, 'recaptcha-container-admin-link', { size: 'invisible' }
                            );
                        }
                        Swal.fire({ title: 'שולח קוד אימות...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                        this.adminLinkConfirmation = await window.fsMethods.signInWithPhoneNumber(
                            window.auth, phoneFormatted, window.adminLinkRecaptchaVerifier
                        );
                        Swal.close();
                        this.adminLinkStep = 'code';
                    } catch (err) {
                        console.error('sendAdminPhoneLinkOtp error:', err.code, err.message);
                        Swal.close();
                        if (window.adminLinkRecaptchaVerifier) {
                            try { window.adminLinkRecaptchaVerifier.clear(); } catch (e) { }
                            window.adminLinkRecaptchaVerifier = null;
                        }
                        Swal.fire('שגיאה בשליחת הקוד', err.message || 'נסה שוב', 'error');
                    }
                },

                async confirmAdminPhoneLinkOtp() {
                    if (!this.adminLinkCode || this.adminLinkCode.length !== 6) {
                        Swal.fire('שגיאה', 'נא להזין קוד בן 6 ספרות', 'error');
                        return;
                    }
                    try {
                        Swal.fire({ title: 'מקשר...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                        // ⚠️ שימו לב: כאן לא קוראים ל-confirm() (שהיה יוצר משתמש חדש/מתחבר
                        // כמשתמש אחר) - במקום זה בונים credential מה-verificationId וקוראים
                        // ל-linkWithCredential על המשתמש המחובר כרגע (המנהל), כדי לצרף את
                        // הטלפון לאותו חשבון בדיוק.
                        const credential = window.fsMethods.PhoneAuthProvider.credential(
                            this.adminLinkConfirmation.verificationId, this.adminLinkCode
                        );
                        await window.fsMethods.linkWithCredential(window.auth.currentUser, credential);
                        this.adminLinkedPhone = window.auth.currentUser.phoneNumber || this.formatPhoneE164(this.adminLinkPhone);
                        this.adminLinkStep = 'phone';
                        this.adminLinkPhone = '';
                        this.adminLinkCode = '';
                        Swal.close();
                        Swal.fire({ icon: 'success', title: 'הטלפון קושר בהצלחה', timer: 1800, showConfirmButton: false });
                    } catch (err) {
                        console.error('confirmAdminPhoneLinkOtp error:', err.code, err.message);
                        Swal.close();
                        const msgs = {
                            'auth/credential-already-in-use': 'המספר הזה כבר מקושר לחשבון אחר',
                            'auth/invalid-verification-code': 'קוד שגוי, נסה שוב'
                        };
                        Swal.fire('שגיאה', msgs[err.code] || err.message || 'הקישור נכשל, נסה שוב', 'error');
                    }
                },

                async unlinkAdminPhone() {
                    const confirm = await Swal.fire({
                        title: 'לבטל את הקישור?',
                        text: 'לא תוכל יותר להיכנס עם קוד SMS למספר הזה',
                        icon: 'warning', showCancelButton: true, confirmButtonText: 'בטל קישור', cancelButtonText: 'ביטול'
                    });
                    if (!confirm.isConfirmed) return;
                    try {
                        await window.fsMethods.unlink(window.auth.currentUser, 'phone');
                        this.adminLinkedPhone = '';
                    } catch (err) {
                        console.error('unlinkAdminPhone error:', err);
                        Swal.fire('שגיאה', 'ביטול הקישור נכשל, נסה שוב', 'error');
                    }
                },

                // ═══════════════════════════════════════════════════════════════
                // תצוגה מקדימה למנהל - "כך המתפלל רואה את המסך", בלי OTP/שרת בכלל.
                // המנהל כבר טוען את כל הנתונים בזיכרון, אז פשוט מסננים מקומית.
                // ═══════════════════════════════════════════════════════════════
                previewAsWorshipper(member) {
                    if (!member) return;
                    this.worshipperMember = {
                        memberUniqueId: member.memberUniqueId,
                        name: member.name,
                        nickname: member.nickname || ''
                    };
                    this.worshipperTransactions = this.transactions
                        .filter(t => t.memberId === member.memberUniqueId)
                        .map(t => this.toMovementRow(t));
                    this.worshipperMovementColumns = this.config.movementColumns || this.defaultMovementColumns();
                    // אם יש לו טלפון ויש עוד מתפללים על אותו טלפון - מציגים גם את
                    // סרגל המעבר, בדיוק כמו שיראה מתפלל אמיתי
                    this.matchedWorshippers = member.phone
                        ? this.members
                            .filter(m => m.phone && String(m.phone).replace(/\D/g, '') === String(member.phone).replace(/\D/g, ''))
                            .map(m => ({ memberUniqueId: m.memberUniqueId, name: m.name, nickname: m.nickname || '' }))
                        : [{ memberUniqueId: member.memberUniqueId, name: member.name, nickname: member.nickname || '' }];
                    this.isAdminPreview = true;
                    this.worshipperMode = true;
                },

                // מעבר בין חשבונות תוך כדי תצוגה מקדימה (בלי לקרוא לשרת)
                previewAsWorshipperById(memberUniqueId) {
                    const m = this.members.find(x => x.memberUniqueId === memberUniqueId);
                    if (m) this.previewAsWorshipper(m);
                },

                // יציאה מתצוגה מקדימה - חוזרים למסך הניהול, בלי להתנתק מכלום
                exitWorshipperPreview() {
                    this.worshipperMode = false;
                    this.isAdminPreview = false;
                    this.worshipperMember = null;
                    this.worshipperTransactions = [];
                    this.matchedWorshippers = [];
                },

                toggleDarkMode() {
                    this.darkMode = !this.darkMode;
                    localStorage.setItem('synagogue_dark_mode', this.darkMode);
                },

                async resetAllData() {
                    const result = await Swal.fire({
                        title: 'איפוס כל הנתונים?',
                        text: 'פעולה זו תמחק את כל המתפללים, התנועות וההגדרות',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'כן, אפס הכל',
                        cancelButtonText: 'ביטול',
                        confirmButtonColor: '#dc3545',
                        input: 'checkbox',
                        inputValue: 0,
                        inputPlaceholder: 'אני מבין שפעולה זו בלתי הפיכה'
                    });

                    if (result.isConfirmed && result.value) {
                        localStorage.removeItem('synagogue_members');
                        localStorage.removeItem('synagogue_transactions');
                        localStorage.removeItem('synagogue_config');
                        localStorage.removeItem('synagogue_funds');
                        localStorage.removeItem('synagogue_favorite_reports');
                        // ===== DEMO MODE: איפוס נתוני הדמו לנתוני seed =====
                        if (window.IS_DEMO) {
                            localStorage.removeItem(DEMO_KEY);
                            localStorage.removeItem(DEMO_EXPIRY_KEY);
                        }
                        // ===== END DEMO MODE =====
                        // Clear Firestore data too
                        if (window.db && window.fsMethods && window.auth && window.auth.currentUser) {
                            const uid = window.auth.currentUser.uid;
                            await Promise.all([
                                window.fsMethods.setDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'members'), { list: [] }),
                                window.fsMethods.setDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'transactions'), { list: [] }),
                                window.fsMethods.setDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'funds'), { list: [] }),
                                window.fsMethods.setDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'paymentPurposes'), { list: [] }),
                            ]);
                            this.funds = [];
                            this.paymentPurposes = [];
                        }
                        await Swal.fire('הושלם!', 'כל הנתונים נמחקו', 'success');
                        location.reload();
                    }
                },

                // Members
                get filteredMembers() {
                    return this.members
                        .filter(m =>
                            (m.nickname || m.name).includes(this.memberSearch) ||
                            m.name.includes(this.memberSearch) ||
                            (m.memberUniqueId && m.memberUniqueId.toString().includes(this.memberSearch))
                        )
                        .slice()
                        //.sort((a, b) => (a.nickname || a.name).localeCompare(b.nickname || b.name, 'he')); //v1.0
                        .sort((a, b) => (a.name).localeCompare(b.name, 'he'));//v1.01
                },

                getMemberBalance(memberId) {
                    // Returns positive = owes money (חובה), negative = credit (זכות)
                    return this.transactions
                        .filter(t => t.memberId === memberId)
                        .reduce((sum, t) => {
                            if (t.transactionType === 'commitments') return sum + (Number(t.commitmentAmount) || 0);
                            if (t.transactionType === 'payments') return sum - (Number(t.paymentAmount) || 0);
                            return sum;
                        }, 0);
                },

                generateMemberUniqueId() {
                    let id;
                    do { id = String(10000 + Math.floor(Math.random() * 90000)); }
                    while (this.members.some(m => m.memberUniqueId === id));
                    return id;
                },

                addMember() {
                    if (!this.nm.name) {
                        Swal.fire('שגיאה', 'נא למלא שם', 'error'); return;
                    }
                    if (this.nm.nickname && !/^[\u0590-\u05FFa-zA-Z0-9 ]+$/.test(this.nm.nickname.trim())) {
                        Swal.fire('שגיאה', 'הכינוי יכול להכיל עברית, אנגלית ורווחים בלבד', 'error'); return;
                    }
                    this.addMemberValues(this.nm.name, this.nm.nickname);
                },

                addMemberValues(_name, _nickname, _phone) {
                    const memberUniqueId = this.generateMemberUniqueId();
                    const nickname = (_nickname && _nickname.trim()) ? _nickname.trim() : _name;
                    const nm = { memberUniqueId, name: _name, nickname, phone: _phone || '' };
                    const phn = _phone;
                    this.config.memberFields.forEach(f => { if (!nm[f.key]) nm[f.key] = ''; });
                    this.members.push(nm);
                    this.saveMembersData();
                    this.selectMember(nm);
                    this.nm = { name: '', nickname: '' };
                },

                processBatchAdd() {
                    if (!this.batchString.trim())
                        return;
                    const rawMembers = this.batchString.split('.').filter(m => m.trim());
                    let addedCount = 0;
                    rawMembers.forEach(memberStr => {
                        const values = memberStr.split(',').map(v => v.trim());
                        if (values.length > 0 && values[0] !== '') {
                            this.addMemberValues(values[0], values[1], values[2]);
                            addedCount++;
                        }
                    });
                    if (addedCount > 0) {
                        this.saveMembersData();
                        this.batchString = '';
                        this.ui.batchAddOpen = false;
                        Swal.fire({ icon: 'success', title: 'הייבוא הושלם', text: `נוספו ${addedCount} מתפללים חדשים!`, timer: 2000, showConfirmButton: false });
                    }
                },

                updateMember() {
                    const idx = this.members.findIndex(m => m.memberUniqueId === this.editingMember.memberUniqueId);
                    if (idx !== -1) {
                        // Validate nickname
                        const nick = (this.editingMember.nickname || '').trim();
                        if (nick && !/^[\u0590-\u05FFa-zA-Z0-9 ]+$/.test(nick)) {
                            Swal.fire('שגיאה', 'הכינוי יכול להכיל עברית, אנגלית ורווחים בלבד', 'error'); return;
                        }
                        // memberUniqueId NEVER changes — preserve original
                        const preserved = { ...this.editingMember, memberUniqueId: this.members[idx].memberUniqueId };
                        this.members[idx] = preserved;
                        this.saveMembersData();
                        this.editingMember = null;
                        if (this.selectedMember && this.selectedMember.memberUniqueId === preserved.memberUniqueId) {
                            this.selectedMember = this.members[idx];
                        }
                    }
                },

                async deleteMember(memberId) {
                    // 1. מציאת המתפלל לפי ה-ID שלו כדי לשלוף את השם
                    const member = this.members.find(m => m.memberUniqueId === memberId);
                    // ברירת מחדל במידה ולא נמצא (למשל: "מתפלל")
                    const memberName = member ? (member.name || member.nickname) : 'מתפלל זה';

                    const result = await Swal.fire({
                        title: 'האם למחוק מתפלל?',
                        html: 'פעולה זו תמחק את המתפלל <br/><span class="delete-btn">' + memberName + '</span><br/> וגם את כל התנועות שלו לצמיתות',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'כן, מחק',
                        cancelButtonText: 'ביטול',
                        confirmButtonColor: '#dc3545'
                    });
                    if (result.isConfirmed) {
                        this.members = this.members.filter(m => m.memberUniqueId !== memberId);
                        this.transactions = this.transactions.filter(t => t.memberId !== memberId);
                        this.saveMembersData();
                        this.saveTransactionsData();
                        if (this.selectedMember && this.selectedMember.memberUniqueId === memberId) {
                            this.selectedMember = null; this.navigate('home');
                        }
                        document.querySelector('body > div:nth-child(2) > main > div:nth-child(6) > div.row.g-4 > div.col-md-5 > div:nth-child(3) > input').value = '';
                    }
                },

                // Columns management
                addColumn(type) {
                    const ts = Date.now();
                    const col = { columnId: `col_${ts}`, title: 'עמודה חדשה', field: `field_${ts}`, type: 'text', fixed: false };
                    if (type === 'commitment') this.config.commitmentColumns.push(col);
                    else if (type === 'payment') this.config.paymentColumns.push(col);
                    else if (type === 'movement') this.config.movementColumns.push(col);
                    this.saveConfigData();
                },

                async deleteColumn(type, index) {
                    const col = type === 'commitment' ? this.config.commitmentColumns[index]
                        : type === 'payment' ? this.config.paymentColumns[index]
                            : this.config.movementColumns[index];
                    if (col.fixed) return;
                    const result = await Swal.fire({ title: 'האם למחוק עמודה?', text: 'הנתונים בעמודה יימחקו', icon: 'warning', showCancelButton: true, confirmButtonText: 'כן, מחק', cancelButtonText: 'ביטול', confirmButtonColor: '#dc3545' });
                    if (result.isConfirmed) {
                        if (type === 'commitment') this.config.commitmentColumns.splice(index, 1);
                        else if (type === 'payment') this.config.paymentColumns.splice(index, 1);
                        else if (type === 'movement') this.config.movementColumns.splice(index, 1);
                        this.saveConfigData();
                    }
                },

                moveColumn(type, index, direction) {
                    const cols = type === 'commitment' ? this.config.commitmentColumns
                        : type === 'payment' ? this.config.paymentColumns : this.config.movementColumns;
                    const ni = index + direction;
                    if (ni < 0 || ni >= cols.length) return;
                    [cols[index], cols[ni]] = [cols[ni], cols[index]];
                    this.saveConfigData();
                },

                addMemberField() {
                    const ts = Date.now();
                    this.config.memberFields.push({ fieldId: `field_${ts}`, name: 'שדה חדש', key: `key_${ts}`, required: false });
                    this.saveConfigData();
                },

                async deleteMemberField(index) {
                    const field = this.config.memberFields[index];
                    if (field.required) return;
                    const result = await Swal.fire({ title: 'האם למחוק שדה?', icon: 'warning', showCancelButton: true, confirmButtonText: 'כן, מחק', cancelButtonText: 'ביטול', confirmButtonColor: '#dc3545' });
                    if (result.isConfirmed) { this.config.memberFields.splice(index, 1); this.saveConfigData(); }
                },

                moveMemberField(index, direction) {
                    const ni = index + direction;
                    if (ni < 0 || ni >= this.config.memberFields.length) return;
                    [this.config.memberFields[index], this.config.memberFields[ni]] = [this.config.memberFields[ni], this.config.memberFields[index]];
                    this.saveConfigData();
                },

                // Home page transactions
                resetHomeEntry() {
                    const cols = this.homeActiveTab === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    this.homeEntry = { memberId: '' };
                    cols.forEach(c => { this.homeEntry[c.field] = (c.type === 'date' ? this.getTodayDate() : ''); });
                },

                addHomeEntry() {
                    if (!this.homeEntry.memberId) { Swal.fire('שגיאה', 'נא לבחור מתפלל', 'error'); return; }
                    const amountField = this.homeActiveTab === 'commitments' ? 'commitmentAmount' : 'paymentAmount';
                    if (this.homeEntry[amountField] === '' || this.homeEntry[amountField] === null || this.homeEntry[amountField] === undefined) { Swal.fire('שגיאה', 'נא להזין סכום', 'error'); return; }
                    // Prevent empty dates
                    const cols2 = this.homeActiveTab === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    cols2.forEach(c => { if (c.type === 'date' && !this.homeEntry[c.field]) this.homeEntry[c.field] = this.getTodayDate(); });

                    // בניית טרנזקציה רק עם שדות הטאב הנוכחי (ללא undefined)
                    const homeEntryFields = {};
                    cols2.forEach(c => { const v = this.homeEntry[c.field]; homeEntryFields[c.field] = (v === undefined ? '' : v); });

                    // בדיקה אם זו התחייבות לקופה
                    const parsedHomePurpose = this.parsePurposeSelection(homeEntryFields.purpose);
                    homeEntryFields.purpose = parsedHomePurpose.label || homeEntryFields.purpose || '';
                    homeEntryFields.fundId = parsedHomePurpose.isFund ? parsedHomePurpose.fundId : null;

                    const transaction = this.sanitize({ transactionId: Date.now(), memberId: this.homeEntry.memberId, transactionType: this.homeActiveTab, ...homeEntryFields });
                    this.transactions.unshift(transaction);

                    // אם זו התחייבות לקופה
                    if (this.homeActiveTab === 'commitments' && parsedHomePurpose.isFund && parsedHomePurpose.fundId) {
                        const member = this.members.find(m => m.memberUniqueId === this.homeEntry.memberId);
                        this.addCommitmentToFund(
                            parsedHomePurpose.label,
                            Number(this.homeEntry.commitmentAmount),
                            this.homeEntry.commitmentDate,
                            this.homeEntry.memberId,
                            member ? member.name : '',
                            transaction.transactionId
                        );
                    }

                    this.saveTransactionsData();
                    this.resetHomeEntry();
                    this.filterHomeTransactions();
                    this.renderTable();
                    Swal.fire({ icon: 'success', title: 'נוסף!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                    setTimeout(() => { this._attachHomeEntryEnterNav(); }, 150);
                },

                _attachHomeEntryEnterNav() {
                    const form = document.getElementById('homeEntryForm');
                    if (!form) return;
                    const inputs = form.querySelectorAll('.home-entry-field');
                    inputs.forEach((inp, i) => {
                        inp.addEventListener('keydown', (e) => {
                            if (e.key !== 'Enter') return;
                            e.preventDefault();
                            if (i < inputs.length - 1) { inputs[i + 1].focus(); }
                            else { this.addHomeEntry(); }
                        });
                    });
                },

                filterHomeTransactions() {
                    let filtered = [...this.transactions];
                    if (this.homeFilters.type !== 'all') filtered = filtered.filter(t => t.transactionType === this.homeFilters.type);
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    switch (this.homeFilters.period) {
                        case 'today':
                            filtered = filtered.filter(t => { const d = new Date(t.commitmentDate || t.paymentDate); d.setHours(0, 0, 0, 0); return d.getTime() === today.getTime(); });
                            break;
                        case 'week':
                            const wa = new Date(today); wa.setDate(wa.getDate() - 7);
                            filtered = filtered.filter(t => new Date(t.commitmentDate || t.paymentDate) >= wa);
                            break;
                        case 'month':
                            const ma = new Date(today); ma.setMonth(ma.getMonth() - 1);
                            filtered = filtered.filter(t => new Date(t.commitmentDate || t.paymentDate) >= ma);
                            break;
                        case 'custom':
                            if (this.homeFilters.fromDate) filtered = filtered.filter(t => (t.commitmentDate || t.paymentDate) >= this.homeFilters.fromDate);
                            if (this.homeFilters.toDate) filtered = filtered.filter(t => (t.commitmentDate || t.paymentDate) <= this.homeFilters.toDate);
                            break;
                    }
                    if (this.homeFilters.search) {
                        const s = this.homeFilters.search.toLowerCase();
                        filtered = filtered.filter(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            const mn = member ? member.name.toLowerCase() : '';
                            return mn.includes(s) || (t.purpose || '').toLowerCase().includes(s) || String(t.commitmentAmount || t.paymentAmount || '').includes(s);
                        });
                    }
                    this.filteredHomeTransactions = filtered;
                },

                // Transactions
                resetEntry() {
                    const cols = this.activeTab === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    this.newEntry = {};
                    cols.forEach(c => {
                        //load  last used date
                        let date = this.lastUsedDate == '' ? this.getTodayDate() : this.lastUsedDate;
                        this.newEntry[c.field] = (c.type === 'date' ? date : '');
                    });
                    this.newEntry.fund = '';
                },

                addNewEntry() {
                    const amountField = this.activeTab === 'commitments' ? 'commitmentAmount' : 'paymentAmount';
                    if (this.newEntry[amountField] === '' || this.newEntry[amountField] === null || this.newEntry[amountField] === undefined) { Swal.fire('שגיאה', 'נא להזין סכום', 'error'); return; }
                    // Prevent empty dates
                    const cols = this.activeTab === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    cols.forEach(c => {
                        if (c.type === 'date' && !this.newEntry[c.field])
                            this.newEntry[c.field] = this.getTodayDate();

                    });

                    // בניית טרנזקציה רק עם שדות הטאב הנוכחי (ללא undefined)
                    const entryFields = {};
                    cols.forEach(c => {
                        const val = this.newEntry[c.field];
                        //save last used date
                        this.lastUsedDate = (c.type === 'date' && val) ? val : this.lastUsedDate;
                        entryFields[c.field] = (val === undefined ? '' : val);
                    });

                    // בדיקה אם זו התחייבות לקופה
                    const parsedPurpose = this.parsePurposeSelection(entryFields.purpose);
                    entryFields.purpose = parsedPurpose.label || entryFields.purpose || '';
                    entryFields.fundId = parsedPurpose.isFund ? parsedPurpose.fundId : null;

                    const transaction = this.sanitize({ transactionId: Date.now(), memberId: this.selectedMember.memberUniqueId, transactionType: this.activeTab, ...entryFields });
                    this.transactions.unshift(transaction);

                    // אם זו התחייבות לקופה
                    if (this.activeTab === 'commitments' && parsedPurpose.isFund && parsedPurpose.fundId) {
                        this.addCommitmentToFund(
                            parsedPurpose.label,
                            Number(this.newEntry.commitmentAmount),
                            this.newEntry.commitmentDate,
                            this.selectedMember.memberUniqueId,
                            this.selectedMember.name,
                            transaction.transactionId
                        );
                    }

                    // שמירת פרטי הפעולה לצורך הודעה/מעבר, לפני איפוס הטופס
                    const addedInfo = {
                        typeLabel: this.activeTab === 'commitments' ? 'התחייבות' : 'תשלום',
                        amount: entryFields[amountField],
                        purpose: entryFields.purpose,
                        memberName: this.selectedMember.name
                    };

                    this.saveTransactionsData();
                    this.resetEntry();
                    this.renderTable();

                    if (this.jumpToMemberAfterAdd) {
                        // מעבר ישיר לחיפוש מתפלל
                        const isMobile = window.innerWidth < 992;
                        if (isMobile) {
                            Swal.fire({
                                icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2800,
                                title: `${addedInfo.typeLabel} נוספה בהצלחה`,
                                html: `<div class="text-end small"><b>${addedInfo.memberName}</b><br>${addedInfo.purpose ? addedInfo.purpose + ' • ' : ''}${addedInfo.amount} ₪</div>`
                            });
                            this.mobileMenuOpen = true;
                        }
                        setTimeout(() => {
                            const el = document.getElementById('memberSearch');
                            if (el) { el.focus(); el.select && el.select(); }
                        }, isMobile ? 200 : 120);
                    } else {
                        // חזרה לשדה סוג פעולה / אופן תשלום (התנהגות קיימת)
                        setTimeout(() => { this._attachNewEntryEnterNav(); }, 120);
                    }
                },

                _attachNewEntryEnterNav() {
                    const form = document.getElementById('newEntryForm');
                    if (!form) return;
                    // חשוב: אין להשתמש ב-cloneNode/replaceChild כאן — זה מנתק את הבינדינג של Alpine.js
                    // (x-model) מהאלמנטים המקוריים ומשאיר את השדות "מתות" לעדכוני מודל.
                    // במקום זאת, מסירים רק את מאזין ה-keydown הקודם שצירפנו (אם קיים) ומצרפים מחדש.
                    const inputs = form.querySelectorAll('.new-entry-field');
                    inputs.forEach((inp, i) => {
                        if (inp._enterNavHandler) {
                            inp.removeEventListener('keydown', inp._enterNavHandler);
                        }
                        const handler = (e) => {
                            if (e.key !== 'Enter') return;
                            e.preventDefault();
                            if (i < inputs.length - 1) { inputs[i + 1].focus(); }
                            else { this.addNewEntry(); }
                        };
                        inp._enterNavHandler = handler;
                        inp.addEventListener('keydown', handler);
                    });
                    // פוקוס ראשוני: לא על שדה התאריך (אינדקס 0), אלא על השדה הבא אחריו
                    if (inputs.length > 1) { inputs[1].focus(); }
                    else if (inputs.length) { inputs[0].focus(); }
                },

                async deleteTransaction(transactionId) {
                    if (this.readOnlyMode) { Swal.fire('שגיאה', 'מצב קריאה בלבד', 'error'); return; }
                    const result = await Swal.fire({
                        title: 'האם למחוק תנועה?', text: 'לחץ ENTER לאישור', icon: 'warning',
                        showCancelButton: true, confirmButtonText: 'מחק', cancelButtonText: 'ביטול',
                        confirmButtonColor: '#dc3545', focusConfirm: true
                    });
                    if (result.isConfirmed) {
                        // הסר מקופה אם היתה מחוברת
                        const deletedTx = this.transactions.find(t => t.transactionId === transactionId);
                        if (deletedTx && (deletedTx.fund || deletedTx.fundId)) {
                            this.removeCommitmentFromFund(transactionId);
                        }

                        this.transactions = this.transactions.filter(t => t.transactionId !== transactionId);
                        this.saveTransactionsData();
                        this.renderTable();
                        this.filterHomeTransactions();
                    }
                },


                async importFromContacts() {
                    if (!('contacts' in navigator)) {
                        Swal.fire('לא נתמך', 'דפדפן זה אינו תומך בגישה לאנשי קשר. נסה Chrome על Android.', 'info');
                        return;
                    }
                    try {
                        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
                        if (!contacts || contacts.length === 0) return;
                        let added = 0;
                        contacts.forEach(contact => {
                            const name = (contact.name && contact.name[0]) ? contact.name[0].trim() : '';
                            const phone = (contact.tel && contact.tel[0]) ? contact.tel[0].trim() : '';
                            if (!name) return;
                            // בדיקה שלא קיים כבר
                            if (this.members.some(m => m.name === name)) return;
                            const memberUniqueId = this.generateMemberUniqueId();
                            const m = { memberUniqueId, name, nickname: name, phone: phone || '' };
                            this.config.memberFields.forEach(f => { if (!m[f.key]) m[f.key] = ''; });
                            this.members.push(m);
                            added++;
                        });
                        if (added > 0) {
                            this.saveMembersData();
                            Swal.fire({ icon: 'success', title: `נוספו ${added} מתפללים`, toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
                        } else {
                            Swal.fire({ icon: 'info', title: 'לא נוספו מתפללים חדשים', text: 'כולם כבר קיימים במערכת', timer: 2000, showConfirmButton: false });
                        }
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            Swal.fire('שגיאה', err.message, 'error');
                        }
                    }
                },



                // Data persistence — Firestore only (localStorage is never used for synagogue/congregant data)
                saveConfigData() {
                    return this._saveToFirestore('config', this.config);
                },
                saveMembersData() {
                    return this._saveToFirestore('members', { list: this.members });
                },
                saveTransactionsData() {
                    return this._saveToFirestore('transactions', { list: this.transactions });
                },
                // Firestore rejects undefined values — recursively replace with ''
                sanitize(val) {
                    if (val === undefined || val === null) return '';
                    if (Array.isArray(val)) return val.map(v => this.sanitize(v));
                    if (typeof val === 'object') {
                        const out = {};
                        for (const k of Object.keys(val)) out[k] = this.sanitize(val[k]);
                        return out;
                    }
                    return val;
                },

                _logDb(status, msg) {
                    const now = new Date();
                    const time = now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL');
                    this.dbLog.unshift({ time, status, msg });
                    if (this.dbLog.length > 200) this.dbLog.pop();
                    try { localStorage.setItem('synagogue_dblog', JSON.stringify(this.dbLog)); } catch (e) { }
                },

                async _doSave(user, collection, safeData, data) {
                    if (!user) return;
                    try {
                        const uid = user.uid;
                        await window.fsMethods.setDoc(
                            window.fsMethods.doc(window.db, 'users', uid, 'data', collection),
                            safeData
                        );
                        this._logDb('ok', `שמירה: ${collection} (${Array.isArray(data.list) ? data.list.length + ' רשומות' : 'הגדרות'})`);
                    } catch (e) {
                        this._logDb('error', `שגיאת שמירה: ${collection} — ${e.message || e}`);
                        console.warn('Firestore save error:', e);
                        if (!this._saveFailToastShown) {
                            this._saveFailToastShown = true;
                            Swal.fire({ icon: 'error', title: 'השמירה נכשלה', text: 'השינוי לא נשמר בבסיס הנתונים. בדוק את החיבור ונסה שוב לפני שממשיכים לעבוד.', toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000 });
                            setTimeout(() => { this._saveFailToastShown = false; }, 8000);
                        }
                    }
                },

                async _saveToFirestore(collection, data) { //v1.02
                    // ===== DEMO MODE: שמירה ל-localStorage בלבד =====
                    if (window.IS_DEMO) {
                        const safeData = this.sanitize(data);
                        if (collection === 'members') saveDemoData({ members: safeData.list || [] });
                        else if (collection === 'transactions') saveDemoData({ transactions: safeData.list || [] });
                        else if (collection === 'config') saveDemoData({ config: safeData });
                        else if (collection === 'funds') saveDemoData({ funds: safeData.list || [] });
                        else if (collection === 'paymentPurposes') saveDemoData({ paymentPurposes: safeData.list || [] });
                        else if (collection === 'backupMeta') saveDemoData({ backupMeta: safeData });
                        this._logDb('ok', `שמירה (דמו): ${collection} (${Array.isArray(data.list) ? data.list.length + ' רשומות' : 'הגדרות'})`);
                        return;
                    }
                    // ===== END DEMO MODE =====

                    // Wait for auth if not ready yet
                    if (!window.db || !window.fsMethods)
                        return;

                    // הגנה מפני דריסת נתונים: לא שומרים מסמך שעוד לא נטען בהצלחה מהמסד
                    // (אחרת ברירות המחדל שבזיכרון היו דורסות הגדרות שמורות, כמו עמודות ומטרות תשלום)
                    if (!this._loadedDocs || !this._loadedDocs[collection]) {
                        this._logDb('error', `שמירה נחסמה: ${collection} (הנתונים עדיין לא נטענו מהמסד)`);
                        if (!this._saveBlockedToastShown) {
                            this._saveBlockedToastShown = true;
                            Swal.fire({ icon: 'warning', title: 'הנתונים עוד לא נטענו מהמסד', text: 'השינוי לא נשמר כדי לא לדרוס הגדרות קיימות. המתן לסיום הטעינה או לחץ על רענון ונסה שוב.', toast: true, position: 'bottom-end', showConfirmButton: false, timer: 4000 });
                            setTimeout(() => { this._saveBlockedToastShown = false; }, 8000);
                        }
                        return;
                    }

                    const safeData = this.sanitize(data);

                    if (window.auth && window.auth.currentUser) {
                        await this._doSave(window.auth.currentUser, collection, safeData, data);
                    } else if (window.auth) {
                        // Wait for auth state to resolve
                        const unsubscribe = window.fsMethods.onAuthStateChanged(window.auth, async (user) => {
                            unsubscribe();
                            await this._doSave(user, collection, safeData, data);
                        });
                    }
                },

                // Fetch data directly from Firestore using Promise.allSettled for fault tolerance
                async _loadFromFirestore() {
                    if (!window.db || !window.fsMethods || !window.auth || !window.auth.currentUser) {
                        throw new Error("Firebase auth or database is not ready.");
                    }

                    try {
                        const _t0 = performance.now();
                        const uid = window.auth.currentUser.uid;

                        // Execute all fetch requests in parallel using Promise.allSettled
                        // This prevents a single non-critical failure from discarding all loaded data
                        const results = await Promise.allSettled([
                            window.fsMethods.getDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'members')),
                            window.fsMethods.getDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'transactions')),
                            window.fsMethods.getDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'config')),
                            window.fsMethods.getDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'funds')),
                            window.fsMethods.getDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'paymentPurposes')),
                            window.fsMethods.getDoc(window.fsMethods.doc(window.db, 'users', uid, 'data', 'backupMeta')),
                        ]);

                        const [membersRes, txRes, configRes, fundsRes, paymentPurposesRes, backupMetaRes] = results;

                        // מסמך נחשב "נטען" רק אם הקריאה הצליחה (גם אם המסמך עדיין לא קיים - יצירה ראשונה)
                        this._loadedDocs = this._loadedDocs || {};
                        const _names = ['members', 'transactions', 'config', 'funds', 'paymentPurposes', 'backupMeta'];
                        results.forEach((r, i) => { if (r.status === 'fulfilled') this._loadedDocs[_names[i]] = true; });

                        // Process members data if successfully fetched
                        if (membersRes.status === 'fulfilled' && membersRes.value.exists()) {
                            this.members = membersRes.value.data().list || [];
                        } else if (membersRes.status === 'rejected') {
                            console.warn("Failed to fetch members:", membersRes.reason);
                        }

                        // Process transactions data if successfully fetched
                        if (txRes.status === 'fulfilled' && txRes.value.exists()) {
                            this.transactions = txRes.value.data().list || [];
                        } else if (txRes.status === 'rejected') {
                            console.warn("Failed to fetch transactions:", txRes.reason);
                        }

                        // Process configuration settings if successfully fetched
                        if (configRes.status === 'fulfilled' && configRes.value.exists()) {
                            this._suppressConfigSave = true;
                            this.config = { ...this.config, ...configRes.value.data() };
                            this.$nextTick(() => { setTimeout(() => { this._suppressConfigSave = false; }, 50); });
                        }

                        // Process funds data if successfully fetched
                        if (fundsRes.status === 'fulfilled' && fundsRes.value.exists()) {
                            this.funds = fundsRes.value.data().list || [];
                        }

                        // Process payment purposes data if successfully fetched
                        if (paymentPurposesRes.status === 'fulfilled' && paymentPurposesRes.value.exists()) {
                            this.paymentPurposes = paymentPurposesRes.value.data().list || [];
                        }

                        // Process backup metadata if successfully fetched
                        if (backupMetaRes.status === 'fulfilled' && backupMetaRes.value.exists()) {
                            this.backupHistory = backupMetaRes.value.data().backups || [];
                            this.restoreHistory = backupMetaRes.value.data().restores || [];
                        }

                        // Check if both primary financial datasets failed to load
                        if (membersRes.status === 'rejected' && txRes.status === 'rejected') {
                            throw new Error("Critical database read failure for members and transactions.");
                        }

                        this.dataLoaded = true;
                        this._logDb('ok', `Load from Firestore: ${this.members.length} members, ${this.transactions.length} transactions (${Math.round(performance.now() - _t0)}ms)`);
                    } catch (e) {
                        this._logDb('error', `Firestore load error — ${e.message || e}`);
                        console.warn('Firestore load error:', e);
                        throw e;
                    }
                },

                // Refresh data from database with automatic retry on network errors
                async refreshMembers(retryCount = 0) {
                    if (window.IS_DEMO) {
                        Swal.fire({ icon: 'info', title: 'מצב הדגמה', text: 'במצב דמו הנתונים נטענים מקומית', timer: 1500, showConfirmButton: false });
                        return;
                    }

                    // Prevent duplicate triggers if already refreshing
                    if (this.isRefreshing && retryCount === 0) return;

                    this.isRefreshing = true;

                    // Show initial loading toast only on the first attempt
                    if (retryCount === 0) {
                        Swal.fire({
                            icon: 'info',
                            title: 'טוען נתונים...',
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 2000,
                            didOpen: () => { Swal.showLoading(); }
                        });
                    }

                    const listTitleEl = document.getElementById('listOfWorshipper');
                    if (listTitleEl) listTitleEl.textContent = "מרענן...";

                    try {
                        // Fetch fresh data from Firestore
                        await this._loadFromFirestore();

                        // Update UI components and active views
                        this.extractAvailablePurposes();
                        this.renderTable();

                        if (this.view === 'home') this.renderHomePage();
                        if (this.view === 'summary') this.renderGlobalSummary();

                        Swal.fire({
                            icon: 'success',
                            title: 'הנתונים עודכנו בהצלחה!',
                            toast: true,
                            position: 'bottom-end',
                            showConfirmButton: false,
                            timer: 1500
                        });

                        this.isRefreshing = false;
                    } catch (e) {
                        // Retry automatically up to 2 times (3 attempts total) on network failure
                        const MAX_RETRIES = 2;
                        if (retryCount < MAX_RETRIES) {
                            const nextAttempt = retryCount + 1;
                            console.warn(`Database connection failed. Retrying attempt ${nextAttempt} of ${MAX_RETRIES}...`);
                            setTimeout(() => {
                                this.refreshMembers(nextAttempt);
                            }, 1500);
                        } else {
                            console.error("Failed to sync with DB after retries:", e);
                            Swal.fire({
                                icon: 'error',
                                title: 'שגיאה בחיבור לבסיס הנתונים',
                                text: 'לא ניתן היה לטעון את הנתונים כעת. בדוק את חיבור האינטרנט ונסה שוב.'
                            });
                            this.isRefreshing = false;

                            // Re-render UI to restore previous state
                            this.renderTable();
                            if (this.view === 'home') this.renderHomePage();
                            if (this.view === 'summary') this.renderGlobalSummary();
                        }
                    }
                },

                // Synagogue name/logo helpers
                updatePageTitle() {
                    const name = this.config.synagogueName || 'ניהול בית הכנסת';
                    document.title = name;
                    const el = document.getElementById('pageTitle');
                    if (el) el.textContent = name;
                    this.saveConfigData();
                },

                loadSynagogueImage(event) {
                    const file = event.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.config.synagogueLogo = e.target.result;
                        this.saveConfigData();
                    };
                    reader.readAsDataURL(file);
                },

                // Keyboard nav for worshippers list
                focusWorshipperItem(idx) {
                    const items = document.querySelectorAll('#worshippersListBox [data-member-idx]');
                    if (items.length === 0) return;
                    const clamped = Math.max(0, Math.min(idx, items.length - 1));
                    items[clamped].focus();
                    items[clamped].scrollIntoView({ block: 'nearest' });
                },

                // Backup preview helpers
                previewBackup(format) {
                    const date = this.getTodayDate();
                    if (format === 'json') {
                        const txsWithNames = this.transactions.map(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            return { ...t, name: member ? member.name : '', nickname: member ? member.nickname : '' };
                        });
                        const backup = { members: this.members, transactions: txsWithNames, config: this.config, funds: this.funds, paymentPurposes: this.paymentPurposes, exportDate: date };
                        this.backupPreviewText = JSON.stringify(backup, null, 2);
                        this.backupPreviewFilename = `backup_${date}.json`;
                    } else if (format === 'batch') {
                        this.backupPreviewText = this._toBatchText(this.transactions);
                        this.backupPreviewFilename = `backup_${date}.txt`;
                    }
                },

                downloadBackupPreview() {
                    if (!this.backupPreviewText) return;
                    const isJson = this.backupPreviewFilename.endsWith('.json');
                    const mime = isJson ? 'application/json' : 'text/plain';
                    this._downloadFile(this.backupPreviewText, this.backupPreviewFilename, mime);
                    if (isJson) this.recordBackupEvent();
                },

                // Print dialog with column selector
                openPrintDialog(tableId) {
                    if (!this.currentTable) { window.print(); return; }
                    const allCols = this.currentTable.getColumns()
                        .filter(c => c.getField() && !['edit_btn', 'delete', 'mov_edit', 'mov_delete', 'mov_goto', '_orphan'].includes(c.getField()))
                        .map(c => ({ field: c.getField(), title: c.getDefinition().title || c.getField(), visible: true }));

                    // Build member+table label for print header
                    const tableLabel = tableId === 'movementsTable' ? 'ריכוז תנועות'
                        : tableId === 'mainTable' ? (this.activeTab === 'commitments' ? 'התחייבויות' : 'תשלומים')
                            : tableId;
                    const memberLabel = this.selectedMember.name;
                    const printTitle = memberLabel ? `${memberLabel} — ${tableLabel}` : tableLabel;

                    // Find matching saved session
                    const sessionKey = `${this.selectedMember?.memberUniqueId || ''}_${tableId}`;
                    const savedSession = this.printSessions.find(s => s.key === sessionKey);
                    let selectedFields = savedSession ? savedSession.fields : allCols.map(c => c.field);

                    const colCheckboxes = allCols.map(c =>
                        `<label class="print-col-checkbox ${selectedFields.includes(c.field) ? 'selected' : ''}" data-field="${c.field}" style="cursor:pointer;margin:3px;">
                            <input type="checkbox" style="display:none;" ${selectedFields.includes(c.field) ? 'checked' : ''}> ${c.title}
                        </label>`
                    ).join('');

                    const savedSessionsHtml = this.printSessions.length > 0
                        ? `<div style="margin-top:12px;"><div class="small fw-bold mb-1" style="color:var(--text-secondary)"><i class="fas fa-print" style="margin-left:4px;"></i>הגדרות שמורות:</div>
                           <div class="print-sessions-row">${this.printSessions.map(s =>
                            `<span class="print-session-tag" data-session-key="${s.key}" title="${s.fields.join(', ')}">
                                   <i class="fas fa-print"></i>${s.label}
                               </span>`
                        ).join('')}</div></div>` : '';

                    Swal.fire({
                        title: `<i class="fas fa-print me-2"></i>הדפסה: ${printTitle}`,
                        html: `<div style="text-align:right">
                            <div class="small fw-bold mb-2" style="color:var(--text-secondary);">בחר עמודות להדפסה:</div>
                            <div id="printColsContainer" style="display:flex;flex-wrap:wrap;gap:4px;">${colCheckboxes}</div>
                            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
                                <button id="printSelectAll" class="btn btn-sm btn-outline-primary">בחר הכל</button>
                                <button id="printDeselectAll" class="btn btn-sm btn-outline-secondary">בטל הכל</button>
                            </div>
                            ${savedSessionsHtml}
                            <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                                <input id="printSessionName" class="form-control form-control-sm" style="max-width:180px;" placeholder="שם להגדרה (לשמירה)">
                                <button id="printSaveSession" class="btn btn-sm btn-outline-success"><i class="fas fa-save me-1"></i>שמור הגדרה</button>
                            </div>
                        </div>`,
                        showCancelButton: true,
                        confirmButtonText: '<i class="fas fa-print me-1"></i>הדפס',
                        cancelButtonText: 'ביטול',
                        width: 560,
                        didOpen: () => {
                            // Toggle checkbox style
                            document.querySelectorAll('.print-col-checkbox').forEach(lbl => {
                                lbl.addEventListener('click', () => {
                                    const cb = lbl.querySelector('input');
                                    cb.checked = !cb.checked;
                                    lbl.classList.toggle('selected', cb.checked);
                                });
                            });
                            document.getElementById('printSelectAll').addEventListener('click', (e) => {
                                e.preventDefault();
                                document.querySelectorAll('.print-col-checkbox').forEach(l => {
                                    l.querySelector('input').checked = true; l.classList.add('selected');
                                });
                            });
                            document.getElementById('printDeselectAll').addEventListener('click', (e) => {
                                e.preventDefault();
                                document.querySelectorAll('.print-col-checkbox').forEach(l => {
                                    l.querySelector('input').checked = false; l.classList.remove('selected');
                                });
                            });
                            // Load saved session on click
                            document.querySelectorAll('.print-session-tag').forEach(tag => {
                                tag.addEventListener('click', () => {
                                    const key = tag.dataset.sessionKey;
                                    const sess = this.printSessions.find(s => s.key === key);
                                    if (!sess) return;
                                    document.querySelectorAll('.print-col-checkbox').forEach(l => {
                                        const checked = sess.fields.includes(l.dataset.field);
                                        l.querySelector('input').checked = checked;
                                        l.classList.toggle('selected', checked);
                                    });
                                });
                            });
                            document.getElementById('printSaveSession').addEventListener('click', (e) => {
                                e.preventDefault();
                                const name = document.getElementById('printSessionName').value.trim();
                                if (!name) return;
                                const fields = [...document.querySelectorAll('.print-col-checkbox input:checked')].map(cb => cb.closest('.print-col-checkbox').dataset.field);
                                const existing = this.printSessions.findIndex(s => s.key === sessionKey);
                                const sess = { key: sessionKey, label: name, fields };
                                if (existing > -1) this.printSessions[existing] = sess;
                                else this.printSessions.push(sess);
                                localStorage.setItem('synagogue_print_sessions', JSON.stringify(this.printSessions));
                                Swal.showValidationMessage('✓ ההגדרה נשמרה');
                                setTimeout(() => Swal.resetValidationMessage(), 1500);
                            });
                        },
                        preConfirm: () => {
                            return [...document.querySelectorAll('.print-col-checkbox input:checked')].map(cb => cb.closest('.print-col-checkbox').dataset.field);
                        }
                    }).then(result => {
                        if (!result.isConfirmed) return;
                        const selectedFieldsToPrint = result.value || allCols.map(c => c.field);
                        this._doPrintWithColumns(tableId, printTitle, allCols, selectedFieldsToPrint);
                    });
                },

                _doPrintWithColumns(tableId, printTitle, allCols, selectedFields) {
                    const data = this.currentTable ? this.currentTable.getData() : [];
                    const cols = allCols.filter(c => selectedFields.includes(c.field));
                    const colW = cols.length > 0 ? Math.floor(100 / cols.length) : 20;

                    const thead = `<tr>${cols.map(c => `<th style="width:${colW}%;padding:6px 8px;background:#2c5f7d;color:white;text-align:right;">${c.title}</th>`).join('')}</tr>`;
                    const tbody = data.map(row =>
                        `<tr>${cols.map(c => `<td style="padding:5px 8px;border-bottom:1px solid #dee2e6;text-align:right;">${row[c.field] !== undefined && row[c.field] !== null ? row[c.field] : ''}</td>`).join('')}</tr>`
                    ).join('');

                    const html = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8">
                        <title>${printTitle}</title>
                        <style>
                            body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                            h2 { font-size: 1.2rem; margin-bottom: 4px; }
                            .sub { font-size: 0.85rem; color: #666; margin-bottom: 14px; }
                            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                            th, td { word-wrap: break-word; }
                            @media print { body { padding: 0; } }
                        </style></head><body>
                        <h2>${printTitle}</h2>
                        <div class="sub">הודפס: ${new Date().toLocaleDateString('he-IL')}</div>
                        <table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
                        <script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }<\/script>
                    </body></html>`;

                    const win = window.open('', '_blank');
                    if (win) { win.document.write(html); win.document.close(); }
                },
                extractAvailablePurposes() {
                    const purposes = new Set();
                    this.transactions.forEach(t => { if (t.purpose) purposes.add(t.purpose); });
                    this.paymentPurposes.forEach(p => purposes.add(p.name));
                    this.availablePurposes = Array.from(purposes);
                },

                setDefaultReportDates() {
                    const today = new Date();
                    const ma = new Date(today);
                    ma.setMonth(ma.getMonth() - 6);
                    this.reportParams.toDate = today.toISOString().split('T')[0];
                    this.reportParams.fromDate = ma.toISOString().split('T')[0];
                },

                togglePurpose(purpose) {
                    const idx = this.reportParams.selectedPurposes.indexOf(purpose);
                    if (idx > -1) this.reportParams.selectedPurposes.splice(idx, 1);
                    else this.reportParams.selectedPurposes.push(purpose);
                    this.reportParams.purpose = this.reportParams.selectedPurposes.join(', ');
                },

                // בונה מחרוזת "פרטים" מכל השדות הנוספים (שאינם תאריך/מטרה/סכום) שהוגדרו לעמודה זו,
                // כולל עמודות מותאמות אישית שנוספו על ידי המשתמש (אופן תשלום, אסמכתא וכו')
                getTransactionDetails(t) {
                    const cols = t.transactionType === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    const skipFields = ['commitmentDate', 'paymentDate', 'purpose', 'commitmentAmount', 'paymentAmount'];
                    return (cols || [])
                        .filter(c => !skipFields.includes(c.field))
                        .map(c => {
                            const val = t[c.field];
                            if (val === undefined || val === null || val === '') return null;
                            return `${c.title}: ${val}`;
                        })
                        .filter(Boolean)
                        .join(' | ');
                },

                // הופך את היסטוריית כל הקופות לשורות בפורמט תנועה, לשימוש בדוחות ובסיכום
                getFundReportRows() {
                    const rows = [];
                    this.funds.forEach(fund => {
                        (fund.history || []).forEach(h => {
                            const typeLabel = h.type === 'commitment' ? 'התחייבות'
                                : h.type === 'addition' ? 'הוספה'
                                    : h.type === 'reduction' ? 'הפחתה' : 'ריקון';
                            rows.push({
                                transactionId: 'fund_' + h.id,
                                memberId: 'fund_' + fund.id,
                                memberName: '🏦 ' + fund.name,
                                transactionType: (h.type === 'commitment' || h.type === 'addition') ? 'commitments' : 'payments',
                                date: h.date || '',
                                purpose: h.type === 'reduction' ? (h.purposeName || typeLabel) : typeLabel,
                                amount: Number(h.amount) || 0,
                                typeLabel,
                                details: h.type === 'reduction' ? (h.details || '') : (h.initiatedBy ? `בוצע ע"י: ${h.initiatedBy}` : '')
                            });
                        });
                    });
                    return rows;
                },

                scrollToElement(targetId) {
                    this.$nextTick(() => {
                        const element = document.getElementById(targetId);
                        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                },

                generateReport() {
                    let filtered = [...this.transactions];
                    if (this.reportParams.purpose || this.reportParams.selectedPurposes.length > 0) {
                        const purposes = this.reportParams.selectedPurposes.length > 0
                            ? this.reportParams.selectedPurposes
                            : this.reportParams.purpose.split(',').map(p => p.trim()).filter(p => p);
                        filtered = filtered.filter(t => purposes.some(p => t.purpose && (this.reportParams.exactMatch ? t.purpose.toLowerCase() === p.toLowerCase() : t.purpose.toLowerCase().includes(p.toLowerCase()))));
                    }
                    if (this.reportParams.fromDate) filtered = filtered.filter(t => (t.commitmentDate || t.paymentDate || '') >= this.reportParams.fromDate);
                    if (this.reportParams.toDate) filtered = filtered.filter(t => (t.commitmentDate || t.paymentDate || '') <= this.reportParams.toDate);
                    if (this.reportParams.selectedMembers.length > 0) filtered = filtered.filter(t => this.reportParams.selectedMembers.includes(t.memberId));

                    let reportData = filtered.map(t => {
                        const member = this.members.find(m => m.memberUniqueId === t.memberId);
                        return { ...t, memberName: member ? member.name : 'לא ידוע', date: t.commitmentDate || t.paymentDate || '', amount: t.commitmentAmount || t.paymentAmount || 0, typeLabel: t.transactionType === 'commitments' ? 'התחייבות' : 'תשלום', details: this.getTransactionDetails(t) };
                    });

                    // ═══ קופות: הוספת פעולות קופה לדוח, באותה לוגיקת הסינון ═══
                    let fundRows = this.getFundReportRows();
                    if (this.reportParams.purpose || this.reportParams.selectedPurposes.length > 0) {
                        const purposes = this.reportParams.selectedPurposes.length > 0
                            ? this.reportParams.selectedPurposes
                            : this.reportParams.purpose.split(',').map(p => p.trim()).filter(p => p);
                        fundRows = fundRows.filter(r => purposes.some(p => r.purpose && (this.reportParams.exactMatch ? r.purpose.toLowerCase() === p.toLowerCase() : r.purpose.toLowerCase().includes(p.toLowerCase()))));
                    }
                    if (this.reportParams.fromDate) fundRows = fundRows.filter(r => (r.date || '') >= this.reportParams.fromDate);
                    if (this.reportParams.toDate) fundRows = fundRows.filter(r => (r.date || '') <= this.reportParams.toDate);
                    if (this.reportParams.selectedMembers.length > 0) fundRows = fundRows.filter(r => this.reportParams.selectedMembers.includes(r.memberId));

                    // מיון: לפי תאריך, ובתוך אותו תאריך - לפי סדר ההזנה המדויק (transactionId מבוסס Date.now(),
                    // כלומר דיוק של מילישניות - עדין הרבה יותר מדקות/שניות)
                    const getEntryTs = (row) => {
                        if (typeof row.transactionId === 'number') return row.transactionId;
                        const m = String(row.transactionId || '').match(/(\d+)/);
                        return m ? Number(m[1]) : 0;
                    };
                    reportData = [...reportData, ...fundRows].sort((a, b) => {
                        const dc = (a.date || '').localeCompare(b.date || '');
                        if (dc !== 0) return dc;
                        return getEntryTs(a) - getEntryTs(b);
                    });

                    if (this.currentTable) { try { this.currentTable.destroy(); } catch (e) { } this.currentTable = null; }

                    // ═══ מצב "יתרה סופית בלבד" — קיבוץ כל התנועות המסוננות לפי מתפלל/קופה, והצגת יתרה אחת בלבד ═══
                    if (this.reportParams.summaryOnly) {
                        const balances = new Map();
                        reportData.forEach(row => {
                            const key = row.memberId;
                            const signedAmount = row.transactionType === 'commitments' ? (Number(row.amount) || 0) : -(Number(row.amount) || 0);
                            if (!balances.has(key)) balances.set(key, { memberId: key, memberName: row.memberName, balance: 0 });
                            balances.get(key).balance += signedAmount;
                        });
                        const summaryData = Array.from(balances.values()).sort((a, b) => b.balance - a.balance);

                        this.currentTable = new Tabulator("#reportTable", {
                            data: summaryData,
                            layout: "fitColumns",
                            responsiveLayout: "collapse",
                            pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200],
                            columns: [
                                { title: "מתפלל", field: "memberName", widthGrow: 2, responsive: 0 },
                                {
                                    title: "יתרה סופית (חובה/זכות)", field: "balance", responsive: 0,
                                    formatter: (cell) => {
                                        const v = Number(cell.getValue()) || 0;
                                        cell.getElement().style.direction = 'ltr';
                                        if (v > 0) { cell.getElement().style.color = '#dc3545'; cell.getElement().style.fontWeight = '600'; return '-₪' + v.toLocaleString(); }
                                        else if (v < 0) { cell.getElement().style.color = '#28a745'; cell.getElement().style.fontWeight = '600'; return '+₪' + Math.abs(v).toLocaleString(); }
                                        return '₪0';
                                    },
                                    bottomCalc: "sum",
                                    bottomCalcFormatter: (cell) => {
                                        const v = Number(cell.getValue()) || 0;
                                        cell.getElement().style.direction = 'ltr';
                                        if (v > 0) { cell.getElement().style.color = '#dc3545'; cell.getElement().style.fontWeight = '600'; return '-₪' + v.toLocaleString(); }
                                        else if (v < 0) { cell.getElement().style.color = '#28a745'; cell.getElement().style.fontWeight = '600'; return '+₪' + Math.abs(v).toLocaleString(); }
                                        return '₪0';
                                    }
                                }
                            ]
                        });
                        const rw2 = document.getElementById('reportTable');
                        if (rw2) rw2.classList.remove('scrollable');
                        this.scrollToElement('reportTable');
                        return;
                    }

                    const reportColBuilders = {
                        memberName: () => ({ title: "מתפלל", field: "memberName", responsive: 0 }),
                        date: () => ({ title: "תאריך", field: "date", responsive: 0, formatter: (cell) => formatDate(cell.getValue()) }),
                        typeLabel: () => ({ title: "סוג", field: "typeLabel", responsive: 1 }),
                        purpose: () => ({ title: "מטרה", field: "purpose", responsive: 1 }),
                        details: () => ({ title: "פרטים", field: "details", responsive: 1 }),
                        amount: () => ({
                            title: "סכום", field: "amount", formatter: (cell) => {
                                const row = cell.getRow().getData();
                                const isCommitment = row.transactionType === 'commitments';
                                return isCommitment ? commitmentFmt(cell) : paymentFmt(cell);
                            },
                            // סה"כ שורת הסיכום: התחייבויות בפלוס, תשלומים במינוס (חיובי = יתרת חובה, שלילי = יתרת זכות)
                            bottomCalc: (values, data) => {
                                return data.reduce((sum, row) => {
                                    const amt = Number(row.amount) || 0;
                                    return sum + (row.transactionType === 'commitments' ? amt : -amt);
                                }, 0);
                            },
                            bottomCalcFormatter: (cell) => {
                                const v = Number(cell.getValue()) || 0;
                                cell.getElement().style.direction = 'ltr';
                                if (v > 0) { cell.getElement().style.color = '#dc3545'; cell.getElement().style.fontWeight = '600'; return '-₪' + v.toLocaleString(); }
                                else if (v < 0) { cell.getElement().style.color = '#28a745'; cell.getElement().style.fontWeight = '600'; return '+₪' + Math.abs(v).toLocaleString(); }
                                return '₪0';
                            },
                            responsive: 0
                        })
                    };
                    this.currentTable = new Tabulator("#reportTable", {
                        data: reportData,
                        layout: this.getTableScroll("reports") ? "fitData" : "fitColumns",
                        responsiveLayout: this.getTableScroll("reports") ? false : "collapse",
                        pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200],
                        columns: this.reportColumnDefs.map(cd => ({ ...reportColBuilders[cd.field](), visible: cd.visible !== false }))
                    });
                    const rw = document.getElementById('reportTable');
                    if (rw) {
                        rw.classList.toggle('scrollable', this.getTableScroll("reports"));
                    }
                    this.scrollToElement('reportTable');
                },

                // מאפשר לשנות אילו עמודות מוצגות בטבלת הדוח — גם לאחר שהטבלה כבר מוצגת על המסך
                toggleReportColumn(field) {
                    const cd = this.reportColumnDefs.find(c => c.field === field);
                    if (!cd) return;
                    cd.visible = !cd.visible;
                    if (this.currentTable && this.currentTable.getColumn && this.currentTable.getColumn(field)) {
                        try { this.currentTable.toggleColumn(field); } catch (e) { this.generateReport(); }
                    }
                },

                saveFavoriteReport() {
                    if (!this.reportParams.saveName) { Swal.fire('שגיאה', 'נא להזין שם לדוח', 'error'); return; }
                    const fav = { id: Date.now(), name: this.reportParams.saveName, params: { purpose: this.reportParams.purpose, selectedPurposes: [...this.reportParams.selectedPurposes], fromDate: this.reportParams.fromDate, toDate: this.reportParams.toDate, selectedMembers: [...this.reportParams.selectedMembers], summaryOnly: !!this.reportParams.summaryOnly } };
                    this.favoriteReports.push(fav);
                    localStorage.setItem('synagogue_favorite_reports', JSON.stringify(this.favoriteReports));
                    Swal.fire({ icon: 'success', title: 'נשמר!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                    this.reportParams.saveName = '';
                },

                loadFavoriteReport(fav) {
                    this.reportParams = { ...this.reportParams, ...fav.params, saveName: '' };
                    this.generateReport();
                },

                async deleteFavoriteReport(id) {
                    const result = await Swal.fire({ title: 'למחוק דוח מועדף?', icon: 'question', showCancelButton: true, confirmButtonText: 'מחק', cancelButtonText: 'ביטול' });
                    if (result.isConfirmed) {
                        this.favoriteReports = this.favoriteReports.filter(f => f.id !== id);
                        localStorage.setItem('synagogue_favorite_reports', JSON.stringify(this.favoriteReports));
                    }
                },

                // מייצר קישור כניסה מאובטח למתפלל: פותח את מסך הזנת הקוד עם הטלפון
                // כבר ממולא, שולח SMS אוטומטית. מחליף את מנגנון ה-readonly=true הישן
                // (שלא היה כרוך באימות אמיתי).
                shareReadOnlyLink() {
                    if (!this.selectedMember) return;
                    if (!this.selectedMember.phone) {
                        Swal.fire('שגיאה', 'למתפלל הזה אין מספר טלפון רשום במערכת', 'warning');
                        return;
                    }
                    const digits = String(this.selectedMember.phone).replace(/\D/g, '');
                    const link = window.location.origin + window.location.pathname + `?phone=${digits}`;

                    Swal.fire({
                        title: 'שתף קישור',
                        html: `
                            <div style="text-align:right">
                                <input id="shareLinkInput" type="text" value="${link}"
                                    style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;margin-bottom:10px;direction:ltr;">
                                
                                <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
                                    <button id="copyBtn" class="btn btn-primary btn-sm">
                                        📋 העתק קישור
                                    </button>
                                    
                                    <a href="https://wa.me/?text=${encodeURIComponent(link)}"
                                    target="_blank"
                                    class="btn btn-success btn-sm">
                                        🟢 שלח ב־WhatsApp
                                    </a>
                                </div>
                            </div>
                        `,
                        showConfirmButton: false,
                        didOpen: () => {
                            const input = document.getElementById('shareLinkInput');
                            const copyBtn = document.getElementById('copyBtn');

                            copyBtn.addEventListener('click', () => {
                                input.select();
                                input.setSelectionRange(0, 99999);
                                document.execCommand('copy');

                                copyBtn.innerHTML = '✅ הועתק!';
                                setTimeout(() => {
                                    copyBtn.innerHTML = '📋 העתק קישור';
                                }, 1500);
                            });
                        }
                    });
                },

                // ══════════════ BATCH INTELLISENSE (rewritten — DOM-based, no Alpine binding on popup) ══════════════

                _batchPopupItems: [],   // current suggestion list
                _batchActiveIdx: -1,    // highlighted index

                // Returns { tokenIdx, currentToken } for cursor position
                _batchCursorToken(ta) {
                    const pos = ta.selectionStart;
                    const full = ta.value;
                    const lineStart = full.lastIndexOf('\n', pos - 1) + 1;
                    const lineText = full.substring(lineStart, pos);
                    const tokens = lineText.split(',');
                    const tokenIdx = tokens.length - 1;
                    const currentToken = tokens[tokenIdx].trimStart();
                    return { tokenIdx, currentToken };
                },

                // Calculate pixel position just below the textarea (reliable cross-browser)
                _batchPopupPosition(ta) {
                    const rect = ta.getBoundingClientRect();
                    const lineH = parseFloat(window.getComputedStyle(ta).lineHeight) || 20;
                    // Count lines up to cursor to approximate vertical position
                    const textBefore = ta.value.substring(0, ta.selectionStart);
                    const linesAbove = (textBefore.match(/\n/g) || []).length;
                    const paddingTop = parseFloat(window.getComputedStyle(ta).paddingTop) || 8;
                    const caretY = rect.top + paddingTop + linesAbove * lineH - ta.scrollTop;
                    const popH = 220;
                    const y = (caretY + lineH + popH > window.innerHeight)
                        ? Math.max(4, caretY - popH - 2)
                        : caretY + lineH + 2;
                    const popW = 200;
                    // anchor to right edge of textarea, RTL-friendly
                    const x = Math.min(rect.right - popW, window.innerWidth - popW - 4);
                    return { x: Math.max(4, x), y };
                },

                // Build suggestion list based on token position
                _batchBuildSuggestions(tokenIdx, currentToken) {
                    const cols = this.batchTxType === 'commitments'
                        ? this.config.commitmentColumns
                        : this.config.paymentColumns;
                    const q = currentToken.toLowerCase();

                    if (tokenIdx === 0) {
                        // Token 0 = member name
                        return this.members
                            .filter(m => !q || m.name.toLowerCase().includes(q))
                            .slice(0, 12)
                            .map(m => ({ value: m.name, label: m.name, detail: m.memberUniqueId, icon: '👤' }));
                    }

                    const col = cols[tokenIdx - 1];
                    if (!col) return [];

                    if (col.type === 'date') {
                        if (q) return [];
                        const today = this.getTodayDate();
                        return [{ value: today, label: formatDate(today), detail: 'היום', icon: '📅' }];
                    }
                    if (col.type === 'list' && col.options) {
                        const opts = col.options.split(',').map(o => o.trim()).filter(Boolean);
                        return opts
                            .filter(o => !q || o.toLowerCase().includes(q))
                            .map(o => ({ value: o, label: o, icon: '☰' }));
                    }
                    if (col.type === 'text') {
                        const existing = [...new Set(
                            this.transactions.map(t => (t[col.field] || '').trim()).filter(Boolean)
                        )];
                        return existing
                            .filter(v => !q || v.toLowerCase().includes(v.toLowerCase().includes(q) ? q : '\x00'))
                            .filter(v => !q || v.toLowerCase().includes(q))
                            .slice(0, 10)
                            .map(v => ({ value: v, label: v, icon: '✏️' }));
                    }
                    // money field — no suggestions (skip)
                    return [];
                },

                // Render the popup div directly (no Alpine reactivity needed)
                _batchRenderPopup(items, activeIdx, x, y) {
                    const popup = document.getElementById('batchPopup');
                    if (!popup) return;
                    if (!items || items.length === 0) { popup.style.display = 'none'; return; }

                    popup.innerHTML = items.map((s, i) =>
                        `<div class="batch-popup-item${i === activeIdx ? ' active' : ''}" data-idx="${i}">
                            <span class="batch-popup-icon">${s.icon || '▸'}</span>
                            <span class="batch-popup-label">${s.label}</span>
                            <span class="batch-popup-detail">${s.detail || ''}</span>
                        </div>`
                    ).join('');

                    popup.style.display = 'block';
                    popup.style.top = y + 'px';
                    popup.style.left = x + 'px';

                    // Attach click handlers
                    popup.querySelectorAll('.batch-popup-item').forEach(el => {
                        el.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            const idx = parseInt(el.getAttribute('data-idx'));
                            this._batchAcceptIdx(idx);
                        });
                    });
                },

                _batchHidePopup() {
                    const popup = document.getElementById('batchPopup');
                    if (popup) popup.style.display = 'none';
                    this._batchPopupItems = [];
                    this._batchActiveIdx = -1;
                },

                _batchAcceptIdx(idx) {
                    const items = this._batchPopupItems;
                    if (idx < 0 || idx >= items.length) return;
                    const s = items[idx];
                    const ta = document.getElementById('batchTxArea');
                    if (!ta) return;

                    const pos = ta.selectionStart, full = ta.value;
                    const lineStart = full.lastIndexOf('\n', pos - 1) + 1;
                    const lineText = full.substring(lineStart, pos);
                    const commaIdx = lineText.lastIndexOf(',');
                    const tokenStart = lineStart + (commaIdx === -1 ? 0 : commaIdx + 1);
                    const afterComma = full.substring(tokenStart);
                    const leadingSpaces = afterComma.length - afterComma.trimStart().length;
                    const replaceStart = tokenStart + leadingSpaces;

                    // Insert value + comma (move to next field automatically)
                    const insert = s.value + ',';
                    const newVal = full.substring(0, replaceStart) + insert + full.substring(pos);
                    this.batchTxString = newVal;
                    this._batchHidePopup();

                    this.$nextTick(() => {
                        const newPos = replaceStart + insert.length;
                        ta.focus();
                        ta.setSelectionRange(newPos, newPos);
                        // Trigger suggestions for next token
                        this.batchTaInput({ target: ta });
                    });
                },

                // Called on @input and @click
                batchTaInput(evt) {
                    const ta = evt.target || document.getElementById('batchTxArea');
                    if (!ta) return;
                    const { tokenIdx, currentToken } = this._batchCursorToken(ta);
                    this.batchActiveToken = tokenIdx;   // ← מעדכן הדגשה בתיבה B
                    const items = this._batchBuildSuggestions(tokenIdx, currentToken);
                    this._batchPopupItems = items;
                    this._batchActiveIdx = items.length > 0 ? 0 : -1;
                    if (items.length > 0) {
                        const pos = this._batchPopupPosition(ta);
                        this._batchRenderPopup(items, 0, pos.x, pos.y);
                    } else {
                        this._batchHidePopup();
                    }
                },

                batchTaKeydown(evt) {
                    const popup = document.getElementById('batchPopup');
                    const visible = popup && popup.style.display !== 'none';
                    if (!visible || this._batchPopupItems.length === 0) return;

                    if (evt.key === 'ArrowDown') {
                        evt.preventDefault();
                        this._batchActiveIdx = Math.min(this._batchActiveIdx + 1, this._batchPopupItems.length - 1);
                        this._batchRenderPopup(this._batchPopupItems, this._batchActiveIdx,
                            parseInt(popup.style.left), parseInt(popup.style.top));
                    } else if (evt.key === 'ArrowUp') {
                        evt.preventDefault();
                        this._batchActiveIdx = Math.max(this._batchActiveIdx - 1, 0);
                        this._batchRenderPopup(this._batchPopupItems, this._batchActiveIdx,
                            parseInt(popup.style.left), parseInt(popup.style.top));
                    } else if (evt.key === 'Enter' || evt.key === 'Tab') {
                        if (this._batchActiveIdx >= 0) {
                            evt.preventDefault();
                            this._batchAcceptIdx(this._batchActiveIdx);
                        } else {
                            this._batchHidePopup();
                        }
                    } else if (evt.key === 'Escape') {
                        evt.preventDefault();
                        this._batchHidePopup();
                    }
                },

                batchTaBlur() {
                    setTimeout(() => { this._batchHidePopup(); this.batchActiveToken = 0; }, 200);
                },

                // kept for backward compat (was called from old batchAcceptSuggestion)
                batchAcceptSuggestion(s) {
                    const idx = this._batchPopupItems.findIndex(i => i.value === s.value);
                    this._batchAcceptIdx(idx >= 0 ? idx : 0);
                },

                processBatchTransactions() {
                    if (!this.batchTxString.trim()) return;
                    const cols = this.batchTxType === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    const lines = this.batchTxString.split('\n').filter(line => line.trim() !== '');
                    let addedCount = 0;
                    const errors = [];
                    lines.forEach((line, li) => {
                        const values = line.split(',').map(v => v.trim());
                        if (!values[0]) return;
                        const member = this.members.find(m => m.memberUniqueId === values[0] || m.name === values[0] || m.name.toLowerCase() === values[0].toLowerCase());
                        if (!member) { errors.push(`שורה ${li + 1}: מתפלל "${values[0]}" לא נמצא`); return; }
                        const transaction = { transactionId: Date.now() + li, memberId: member.memberUniqueId, transactionType: this.batchTxType };
                        cols.forEach((col, i) => {
                            const val = (values[i + 1] || '').trim();
                            transaction[col.field] = val || (col.type === 'date' ? this.getTodayDate() : '');
                        });
                        const amountField = this.batchTxType === 'commitments' ? 'commitmentAmount' : 'paymentAmount';
                        if (!transaction[amountField]) { errors.push(`שורה ${li + 1}: חסר סכום`); return; }
                        this.transactions.unshift(this.sanitize(transaction));
                        addedCount++;
                    });
                    if (addedCount > 0) { this.saveTransactionsData(); this.filterHomeTransactions(); this.renderTable(); this.batchTxString = ''; this.ui.batchTxOpen = false; }
                    if (errors.length > 0) {
                        Swal.fire({ icon: addedCount > 0 ? 'warning' : 'error', title: addedCount > 0 ? `נוספו ${addedCount} תנועות (עם שגיאות)` : 'שגיאות בייבוא', html: errors.join('<br>') });
                    } else if (addedCount > 0) {
                        Swal.fire({ icon: 'success', title: 'הייבוא הושלם', text: `נוספו ${addedCount} תנועות!`, timer: 2000, showConfirmButton: false });
                    }
                },

                /** Renders the transaction table */
                renderTable() {
                    if (this.currentTable) { try { this.currentTable.destroy(); } catch (e) { } this.currentTable = null; }
                    if (this.view === 'summary') { this.renderGlobalSummary(); return; }
                    if (this.view === 'home') { this.renderHomePage(); return; }
                    if (this.view === 'reports') return;
                    if (!this.selectedMember || this.view !== 'account' || this.activeTab === 'edit') return;
                    if (this.activeTab === 'movements') { this.renderMovementsTable(); return; }

                    // הגנה: תמיד יהיה מערך עמודות תקין. אם ההגדרות ב-config חסרות/פגומות (למשל אחרי
                    // שחזור גיבוי ישן), נופלים חזרה לעמודות ברירת מחדל במקום שהטבלה תיעלם בשקט.
                    const fallbackCommitmentCols = [
                        { columnId: 'ob_date', title: 'תאריך', field: 'commitmentDate', type: 'date', fixed: true },
                        { columnId: 'ob_purpose', title: 'מטרת תשלום', field: 'purpose', type: 'list', options: 'תרומה שנתית,תרומה חודשית,עליה לתורה,הנצחה,אחר', fixed: true },
                        { columnId: 'ob_amount', title: 'סכום', field: 'commitmentAmount', type: 'money', fixed: true }
                    ];
                    const fallbackPaymentCols = [
                        { columnId: 'pay_date', title: 'תאריך', field: 'paymentDate', type: 'date', fixed: true },
                        { columnId: 'pay_purpose', title: 'מטרת תשלום', field: 'purpose', type: 'text', fixed: false },
                        { columnId: 'pay_method', title: 'אופן תשלום', field: 'paymentMethod', type: 'list', options: 'מזומן,העברה,צ׳ק,אשראי', fixed: false },
                        { columnId: 'pay_reference', title: 'אסמכתא', field: 'reference', type: 'text', fixed: false },
                        { columnId: 'pay_amount', title: 'סכום', field: 'paymentAmount', type: 'money', fixed: true }
                    ];
                    let curCols = this.activeTab === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                    if (!Array.isArray(curCols) || curCols.length === 0) {
                        console.warn('renderTable: הגדרות עמודות חסרות/פגומות עבור', this.activeTab, '— נופלים לברירת מחדל');
                        curCols = this.activeTab === 'commitments' ? fallbackCommitmentCols : fallbackPaymentCols;
                        if (this.activeTab === 'commitments') this.config.commitmentColumns = curCols;
                        else this.config.paymentColumns = curCols;
                    }

                    let cols;
                    try {
                        cols = curCols.map(c => ({
                            title: c.title, field: c.field,
                            editor: this.readOnlyMode ? false : (c.type === 'list' ? 'list' : c.type === 'date' ? 'input' : 'input'),
                            formatter: c.type === 'money' ? (this.activeTab === 'commitments' ? commitmentFmt : paymentFmt) : (c.type === 'date' ? (cell) => formatDate(cell.getValue()) : undefined),
                            editorParams: c.type === 'list' ? (c.field === 'purpose' ? { values: this.getPurposeOptions(this.activeTab).map(opt => ({ label: opt.label, value: opt.value, disabled: opt.disabled || false })) } : { values: (c.options || '').split(',').filter(o => o.trim() !== '').map(o => ({ label: o.trim(), value: o.trim() })) }) : {},
                            responsive: 0
                        }));
                    } catch (err) {
                        console.error('renderTable: שגיאה בבניית עמודות הטבלה', err);
                        this._logDb && this._logDb('error', `שגיאה בבניית טבלת ${this.activeTab}: ${err.message || err}`);
                        Swal.fire({ icon: 'error', title: 'שגיאה בטעינת הטבלה', text: 'אירעה שגיאה בהצגת הנתונים. נסה לרענן את הדף.', toast: true, position: 'top-end', timer: 4000, showConfirmButton: false });
                        return;
                    }

                    if (!this.readOnlyMode) {
                        cols.push({ title: 'עריכה', field: 'edit_btn', width: 60, headerSort: false, responsive: 0, formatter: () => '<span class="edit-btn" title="ערוך שורה"><i class="fa fa-edit" aria-hidden="true"></i></span>', cellClick: (e, cell) => { this.toggleRowEdit(cell.getRow()); } });
                        cols.push({ title: 'מחק', field: 'delete', width: 55, headerSort: false, responsive: 0, formatter: () => '<span class="delete-btn"><i class="fa fa-trash" aria-hidden="true"></i></span>', cellClick: (e, cell) => { this.deleteTransaction(cell.getRow().getData().transactionId); } });
                    }

                    let data = this.transactions.filter(t => t.memberId === this.selectedMember.memberUniqueId && t.transactionType === this.activeTab);

                    this.currentTable = new Tabulator("#mainTable", {
                        data,
                        layout: this.getTableScroll("account") ? "fitData" : "fitColumns",
                        responsiveLayout: this.getTableScroll("account") ? false : "collapse",
                        rowFormatter: (row) => {
                            if (this.highlightedRowId && row.getData().transactionId == this.highlightedRowId) {
                                row.getElement().setAttribute('data-transaction-id', this.highlightedRowId);
                            }
                            if (row.getData()._editing) {
                                row.getElement().classList.add('row-editing');
                            }
                            if (row.getData()._newRow) {
                                row.getElement().classList.add('new-row-input');
                            }
                        },
                        pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200],
                        columns: cols,
                        cellEdited: (cell) => {
                            if (!this.readOnlyMode) {
                                const rowData = cell.getRow().getData();
                                if (rowData._newRow) return; // handled separately
                                const idx = this.transactions.findIndex(t => t.transactionId === rowData.transactionId);
                                if (idx !== -1) {
                                    // אם יש שינוי בעמודת purpose (סוג פעולה)
                                    if (cell.getField() === 'purpose') {
                                        const parsed = this.parsePurposeSelection(cell.getValue());
                                        this.transactions[idx].purpose = parsed.label || cell.getValue();
                                        const oldFundId = this.transactions[idx].fundId;
                                        this.transactions[idx].fundId = parsed.isFund ? parsed.fundId : null;

                                        // אם היה קודם commitment לקופה והשתנה
                                        if (oldFundId && oldFundId !== this.transactions[idx].fundId) {
                                            this.removeCommitmentFromFund(rowData.transactionId);
                                            if (this.transactions[idx].fundId && this.transactions[idx].transactionType === 'commitments') {
                                                const fund = this.getFundById(this.transactions[idx].fundId);
                                                if (fund) {
                                                    this.addCommitmentToFund(
                                                        fund.name,
                                                        this.transactions[idx].commitmentAmount,
                                                        this.transactions[idx].commitmentDate,
                                                        this.transactions[idx].memberId,
                                                        this.transactions[idx].memberName || '',
                                                        rowData.transactionId
                                                    );
                                                }
                                            }
                                        } else if (!oldFundId && this.transactions[idx].fundId && this.transactions[idx].transactionType === 'commitments') {
                                            const fund = this.getFundById(this.transactions[idx].fundId);
                                            if (fund) {
                                                this.addCommitmentToFund(
                                                    fund.name,
                                                    this.transactions[idx].commitmentAmount,
                                                    this.transactions[idx].commitmentDate,
                                                    this.transactions[idx].memberId,
                                                    this.transactions[idx].memberName || '',
                                                    rowData.transactionId
                                                );
                                            }
                                        }
                                    } else {
                                        this.transactions[idx][cell.getField()] = cell.getValue();
                                        // אם נערך הסכום או התאריך של התחייבות לקופה
                                        if (this.transactions[idx].fundId && this.transactions[idx].transactionType === 'commitments' &&
                                            (cell.getField() === 'commitmentAmount' || cell.getField() === 'commitmentDate')) {
                                            this.updateCommitmentInFund(rowData.transactionId, this.transactions[idx].commitmentAmount, this.transactions[idx].commitmentDate, this.transactions[idx].fundId);
                                        }
                                    }
                                    this.saveTransactionsData();
                                }
                                // Flash yellow after edit
                                const el = cell.getRow().getElement();
                                el.classList.remove('row-saved-flash');
                                void el.offsetWidth;
                                el.classList.add('row-saved-flash');
                                setTimeout(() => el.classList.remove('row-saved-flash'), 2400);
                            }
                        },
                        keybindings: false
                    });

                    const wrapper = document.getElementById('mainTable');
                    if (wrapper) wrapper.parentElement.classList.toggle('scrollable', this.getTableScroll("account"));

                    // Add Enter-key navigation between add form fields
                    if (!this.readOnlyMode) {
                        setTimeout(() => {
                            const addForm = document.querySelector('.content-card.dashed .row.g-2');
                            if (addForm) {
                                const inputs = addForm.querySelectorAll('input, select');
                                inputs.forEach((inp, i) => {
                                    inp.addEventListener('keydown', (e) => {
                                        if (e.key !== 'Enter') return;
                                        e.preventDefault();
                                        if (i < inputs.length - 1) { inputs[i + 1].focus(); }
                                        else { this.addNewEntry(); setTimeout(() => { const newInputs = addForm.querySelectorAll('input, select'); if (newInputs.length) newInputs[0].focus(); }, 50); }
                                    });
                                });
                            }
                        }, 100);
                    }

                    // Highlight row if needed
                    if (this.highlightedRowId) {
                        setTimeout(() => {
                            const row = document.querySelector(`[data-transaction-id="${this.highlightedRowId}"]`);
                            if (row) {
                                row.classList.add('highlight-row');
                                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            this.highlightedRowId = null;
                        }, 300);
                    }
                },

                toggleRowEdit(row) {
                    const el = row.getElement();
                    const isEditing = el.classList.contains('row-editing');
                    // Remove editing from all rows first
                    document.querySelectorAll('.row-editing').forEach(r => r.classList.remove('row-editing'));
                    // Remove any existing confirm/cancel buttons
                    document.querySelectorAll('.row-edit-confirm-bar').forEach(b => b.remove());
                    if (!isEditing) {
                        el.classList.add('row-editing');
                        // Store original data for cancel
                        const origData = { ...row.getData() };
                        // Open all editable cells in the row
                        row.getCells().forEach(cell => {
                            const def = cell.getColumn().getDefinition();
                            if (def.editor) cell.edit(true);
                        });
                        // Replace edit button cell with confirm/cancel
                        const editCells = row.getCells().filter(c => ['edit_btn', 'mov_edit'].includes(c.getField()));
                        if (editCells.length) {
                            const editCell = editCells[0];
                            const cellEl = editCell.getElement();
                            cellEl.innerHTML = '<span class="row-confirm-btn" title="אישור" style="cursor:pointer;color:#28a745;font-weight:bold;font-size:1.1rem;margin-left:4px;">✓</span><span class="row-cancel-btn" title="ביטול" style="cursor:pointer;color:#dc3545;font-weight:bold;font-size:1.1rem;">✕</span>';
                            cellEl.querySelector('.row-confirm-btn').addEventListener('click', (e) => {
                                e.stopPropagation();
                                // Save all cell values to transactions
                                const rowData = row.getData();
                                const movFieldMap = { date: rowData.transactionType === 'commitments' ? 'commitmentDate' : 'paymentDate' };
                                row.getCells().forEach(cell => {
                                    const field = cell.getField();
                                    const val = cell.getValue();
                                    if (field && !['edit_btn', 'mov_edit', 'delete', 'mov_delete', 'mov_goto', 'mov_goto_ob', 'mov_goto_pay', '_orphan'].includes(field)) {
                                        const realField = movFieldMap[field] || field;
                                        const idx = this.transactions.findIndex(t => t.transactionId === rowData.transactionId);
                                        if (idx !== -1) this.transactions[idx][realField] = val;
                                    }
                                });
                                this.saveTransactionsData();
                                el.classList.remove('row-editing');
                                el.classList.remove('row-saved-flash');
                                void el.offsetWidth;
                                el.classList.add('row-saved-flash');
                                setTimeout(() => el.classList.remove('row-saved-flash'), 2400);
                                this.renderTable();
                            });
                            cellEl.querySelector('.row-cancel-btn').addEventListener('click', (e) => {
                                e.stopPropagation();
                                el.classList.remove('row-editing');
                                this.renderTable();
                            });
                        }
                        // ESC to cancel
                        const escHandler = (e) => {
                            if (e.key === 'Escape') { el.classList.remove('row-editing'); this.renderTable(); document.removeEventListener('keydown', escHandler); }
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                // trigger confirm
                                const confirmBtn = el.querySelector('.row-confirm-btn');
                                if (confirmBtn) confirmBtn.click();
                                document.removeEventListener('keydown', escHandler);
                            }
                        };
                        document.addEventListener('keydown', escHandler);
                    }
                },

                startEditHomeRow(cell) {
                    const rowEl = cell.getRow().getElement();
                    document.querySelectorAll('.row-editing').forEach(r => r.classList.remove('row-editing'));
                    rowEl.classList.add('row-editing');
                    cell.getRow().getCells().forEach(c => {
                        const def = c.getColumn().getDefinition();
                        if (def.editor) c.edit(true);
                    });
                },

                renderMovementsTable() {
                    if (!this.selectedMember) return;
                    const memberTransactions = this.transactions.filter(t => t.memberId === this.selectedMember.memberUniqueId);
                    // Show each transaction as a separate row (no aggregation)
                    const movementsData = memberTransactions.map(t => {
                        const oblAmt = Number(t.commitmentAmount) || 0;
                        const payAmt = Number(t.paymentAmount) || 0;
                        return {
                            transactionId: t.transactionId,
                            transactionType: t.transactionType,
                            date: t.commitmentDate || t.paymentDate || '',
                            purpose: t.purpose || '',
                            paymentType: t.paymentMethod || '',
                            reference: t.reference || '',
                            commitmentAmount: oblAmt,
                            paymentAmount: payAmt,
                            difference: oblAmt - payAmt
                        };
                    });
                    const allMovFields = ['date', 'purpose', 'paymentType', 'reference', 'commitmentAmount', 'paymentAmount', 'difference'];
                    const activeFields = (this.config.movementColumns || []).map(c => c.field);
                    const deletedFields = allMovFields.filter(f => !activeFields.includes(f));
                    const cols = (this.config.movementColumns || []).map(c => {
                        const colDef = { title: c.title, field: c.field, bottomCalc: c.type === 'money' ? 'sum' : undefined, responsive: 0 };

                        if (c.field === 'difference') {
                            colDef.formatter = () => '';
                            colDef.bottomCalcFormatter = (cell) => {
                                const num = Number(cell.getValue()) || 0;
                                const el = cell.getElement();
                                el.style.direction = 'ltr';
                                el.style.textAlign = 'left';
                                if (num > 0) { el.style.color = '#dc3545'; el.style.fontWeight = '600'; return '-₪' + Math.abs(num).toLocaleString(); }
                                if (num < 0) { el.style.color = '#28a745'; el.style.fontWeight = '600'; return '+₪' + Math.abs(num).toLocaleString(); }
                                return '₪0';
                            };
                        } else if (c.field === 'commitmentAmount') {
                            colDef.formatter = commitmentFmt;
                            colDef.bottomCalcFormatter = (cell) => {
                                const num = Number(cell.getValue()) || 0;
                                const el = cell.getElement();
                                el.style.direction = 'ltr';
                                el.style.textAlign = 'left';
                                if (num > 0) { el.style.fontWeight = '600'; return '+₪' + num.toLocaleString(); }
                                return '₪0';
                            };
                        } else if (c.field === 'paymentAmount') {
                            colDef.formatter = paymentFmt;
                            colDef.bottomCalcFormatter = (cell) => {
                                const num = Number(cell.getValue()) || 0;
                                const el = cell.getElement();
                                el.style.direction = 'ltr';
                                el.style.textAlign = 'left';
                                if (num > 0) { el.style.fontWeight = '600'; return '-₪' + num.toLocaleString(); }
                                return '₪0';
                            };
                        } else {
                            if (c.type === 'money') {
                                colDef.formatter = moneyFmt;
                            } else if (c.type === 'date') {
                                colDef.formatter = (cell) => formatDate(cell.getValue());
                            }
                        }
                        return colDef;
                    });
                    const hasOrphanData = deletedFields.length > 0 && movementsData.some(row => deletedFields.some(f => row[f] !== undefined && row[f] !== '' && row[f] !== 0));
                    if (hasOrphanData) {
                        cols.unshift({
                            title: '', field: '_orphan', width: 36, headerSort: false, responsive: 0,
                            formatter: (cell) => {
                                const row = cell.getRow().getData();
                                return deletedFields.some(f => row[f] !== undefined && row[f] !== '' && row[f] !== 0) ? '<span style="cursor:pointer;font-size:1rem;" title="נתונים בעמודות שנמחקו">⚠️</span>' : '';
                            },
                            cellClick: (e, cell) => {
                                const row = cell.getRow().getData();
                                const hasData = deletedFields.some(f => row[f] !== undefined && row[f] !== '' && row[f] !== 0);
                                if (!hasData) return;
                                const rowEl = cell.getRow().getElement();
                                const existingBox = rowEl.parentNode.querySelector(`.orphan-box[data-row="${row.transactionId}"]`);
                                if (existingBox) { existingBox.style.maxHeight = existingBox.style.maxHeight === '0px' || !existingBox.style.maxHeight ? '200px' : '0px'; existingBox.style.opacity = existingBox.style.opacity === '0' || !existingBox.style.opacity ? '1' : '0'; return; }
                                const box = document.createElement('div');
                                box.className = 'orphan-box';
                                box.setAttribute('data-row', row.transactionId);
                                box.style.cssText = 'max-height:200px;overflow:hidden;transition:max-height 0.3s ease,opacity 0.3s ease;opacity:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:10px 16px;margin:4px 0;display:flex;gap:16px;flex-wrap:wrap;';
                                const fieldLabels = { date: 'תאריך', purpose: 'מטרת התשלום', paymentType: 'סוג תשלום', reference: 'אסמכתא', commitmentAmount: 'סכום התחייבות', paymentAmount: 'תשלום בפועל' };
                                deletedFields.forEach(f => {
                                    const val = row[f];
                                    if (val === undefined || val === '' || val === 0) return;
                                    const item = document.createElement('div');
                                    item.style.cssText = 'display:flex;flex-direction:column;gap:2px;';
                                    item.innerHTML = `<span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${fieldLabels[f] || f}</span><span style="color:var(--text-primary);">${val}</span>`;
                                    box.appendChild(item);
                                });
                                rowEl.insertAdjacentElement('afterend', box);
                            }
                        });
                    }

                    // Add action buttons for movements table
                    if (!this.readOnlyMode) {
                        cols.push({
                            title: 'מחק', field: 'mov_delete', width: 65, headerSort: false, responsive: 0,
                            formatter: () => '<span class="delete-btn" title="מחק"><i class="fa fa-trash" aria-hidden="true"></i></span>',
                            cellClick: (e, cell) => { this.deleteTransaction(cell.getRow().getData().transactionId); }
                        });
                        cols.push({
                            title: 'עבור אל', field: 'mov_goto', width: 65, headerSort: false, responsive: 0,
                            formatter: (cell) => {
                                const type = cell.getRow().getData().transactionType;
                                if (type === 'commitments')
                                    return '<span title="עבור להתחייבות" style="cursor:pointer;color:#2c5f7d;font-size:0.9rem;font-weight:600;">חובה</span>';
                                return '<span title="עבור לתשלום" style="cursor:pointer;color:#28a745;font-size:0.9rem;font-weight:600;">זיכוי</span>';
                            },
                            cellClick: (e, cell) => {
                                const data = cell.getRow().getData();
                                const tab = data.transactionType === 'commitments' ? 'commitments' : 'payments';
                                this.goToMemberTransactionInTab(data.transactionId, tab);
                            }
                        });
                    }

                    if (this.currentTable) {
                        try { this.currentTable.destroy(); } catch (e) { }
                        this.currentTable = null;
                    }
                    this.currentTable = new Tabulator("#movementsTable", {
                        data: movementsData,
                        layout: this.getTableScroll("movements") ? "fitData" : "fitColumns",
                        responsiveLayout: this.getTableScroll("movements") ? false : "collapse",
                        pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200],
                        rowFormatter: (row) => {
                            if (this.highlightedRowId && row.getData().transactionId == this.highlightedRowId) {
                                row.getElement().setAttribute('data-transaction-id', this.highlightedRowId);
                            }
                        },
                        columns: cols,
                        cellEdited: (cell) => {
                            if (!this.readOnlyMode) {
                                const rowData = cell.getRow().getData();
                                const field = cell.getField();
                                const val = cell.getValue();
                                // Map movementsTable field names back to transactions field names
                                const movFieldMap = { date: rowData.transactionType === 'commitments' ? 'commitmentDate' : 'paymentDate' };
                                const realField = movFieldMap[field] || field;
                                const idx = this.transactions.findIndex(t => t.transactionId === rowData.transactionId);
                                if (idx !== -1) this.transactions[idx][realField] = val;
                                this.saveTransactionsData();
                                const el = cell.getRow().getElement();
                                el.classList.remove('row-saved-flash');
                                void el.offsetWidth;
                                el.classList.add('row-saved-flash');
                                setTimeout(() => el.classList.remove('row-saved-flash'), 2400);
                            }
                        }
                    });
                    const wrapper = document.getElementById('movementsTable');
                    if (wrapper) wrapper.parentElement.classList.toggle('scrollable', this.getTableScroll("movements"));

                    // Highlight if needed
                    if (this.highlightedRowId) {
                        setTimeout(() => {
                            const row = document.querySelector(`[data-transaction-id="${this.highlightedRowId}"]`);
                            if (row) {
                                row.classList.add('highlight-row');
                                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            this.highlightedRowId = null;
                        }, 300);
                    }
                },

                // ══════════════ EXPORT / IMPORT FUNCTIONS ══════════════

                _getFilteredTransactions() {
                    let txs = [...this.transactions];
                    if (this.ieFilters.type !== 'all') txs = txs.filter(t => t.transactionType === this.ieFilters.type);
                    if (this.ieFilters.memberId) txs = txs.filter(t => t.memberId === this.ieFilters.memberId);
                    if (this.ieFilters.fromDate) txs = txs.filter(t => (t.commitmentDate || t.paymentDate || '') >= this.ieFilters.fromDate);
                    if (this.ieFilters.toDate) txs = txs.filter(t => (t.commitmentDate || t.paymentDate || '') <= this.ieFilters.toDate);
                    return txs;
                },

                _downloadFile(content, filename, mimeType) {
                    const blob = new Blob([content], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = filename; a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                },

                _toBatchText(transactions) {
                    const obls = transactions.filter(t => t.transactionType === 'commitments');
                    const pays = transactions.filter(t => t.transactionType === 'payments');
                    let out = '';
                    if (obls.length) {
                        out += 'commitments\n';
                        const cols = this.config.commitmentColumns;
                        obls.forEach(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            const name = member ? member.name : t.memberId;
                            out += [name, ...cols.map(c => t[c.field] || '')].join(',') + '\n';
                        });
                    }
                    if (pays.length) {
                        if (out) out += '\n';
                        out += 'payments\n';
                        const cols = this.config.paymentColumns;
                        pays.forEach(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            const name = member ? member.name : t.memberId;
                            out += [name, ...cols.map(c => t[c.field] || '')].join(',') + '\n';
                        });
                    }
                    return out;
                },

                // Export functions
                exportToExcel(tableId, filename) {
                    if (!this.currentTable) { Swal.fire('שגיאה', 'אין טבלה לייצוא', 'error'); return; }
                    this.currentTable.download("xlsx", `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`, { sheetName: filename });
                },
                exportWorshipperToExcel() {
                    if (!this.worshipperTransactions || this.worshipperTransactions.length === 0) {
                        Swal.fire('שגיאה', 'אין נתונים לייצוא', 'error');
                        return;
                    }
                    const cols = this.worshipperMovementColumns || [];
                    const rows = this.worshipperTransactions.map(t => {
                        const rowData = {};
                        cols.forEach(col => {
                            if (col.field === 'difference') {
                                rowData[col.title] = t.difference;
                            } else {
                                rowData[col.title] = this.getWorshipperCellValue(t, col);
                            }
                        });
                        return rowData;
                    });

                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(rows);
                    XLSX.utils.book_append_sheet(wb, ws, "ריכוז תנועות");
                    const filename = `ריכוז_תנועות_${this.worshipperMember?.name || 'מתפלל'}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    XLSX.writeFile(wb, filename);
                },
                exportToPDF(tableId, filename) {
                    const element = document.getElementById(tableId);
                    if (!element) {
                        Swal.fire('שגיאה', 'לא נמצאה טבלה לייצוא', 'error');
                        return;
                    }

                    // שליפת שם בית הכנסת והתאריך הנוכחי
                    const synagogueName = (this.config && this.config.synagogueName) ? this.config.synagogueName : 'ניהול בית הכנסת';
                    const currentDate = new Date().toLocaleDateString('he-IL');

                    // יצירת קונטיינר זמני להפקת ה-PDF
                    const pdfContainer = document.createElement('div');
                    pdfContainer.style.direction = 'rtl';
                    pdfContainer.style.padding = '10px';
                    pdfContainer.style.background = '#ffffff';
                    pdfContainer.style.color = '#000000';
                    pdfContainer.style.wordSpacing = '3px'; // תיקון לרווחים בעברית

                    // בניית ה-HTML של הכותרת והעתק של הטבלה
                    pdfContainer.innerHTML = `
                        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c5f7d; padding-bottom: 10px;">
                            <h2 style="margin: 0; color: #2c5f7d; font-size: 22px; font-weight: bold;">${this.escapeHtml(synagogueName)}</h2>
                            <h3 style="margin: 5px 0 0 0; color: #333; font-size: 18px;">${this.escapeHtml(filename.replace(/_/g, ' '))}</h3>
                            <div style="margin-top: 5px; font-size: 13px; color: #666;">--תאריך הפקה--</div>
                            <div style="margin-top: 5px; font-size: 13px; color: #666;">${currentDate}</div>
                        </div>
                        <div>${element.outerHTML}</div>
                    `;

                    // הוספה זמנית ל-body (הכרחי עבור html2canvas)
                    document.body.appendChild(pdfContainer);

                    const options = {
                        margin: [10, 10, 10, 10],
                        filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            letterRendering: true
                        },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    Swal.fire({
                        title: 'מפיק קובץ PDF...',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });

                    html2pdf().set(options).from(pdfContainer).save().then(() => {
                        document.body.removeChild(pdfContainer); // הסרת האלמנט הזמני
                        Swal.close();
                    }).catch(err => {
                        if (document.body.contains(pdfContainer)) {
                            document.body.removeChild(pdfContainer);
                        }
                        console.error(err);
                        Swal.fire('שגיאה', 'אירעה שגיאה בהפקת ה-PDF', 'error');
                    });
                },

                exportToPDF_old(tableId, filename) {
                    // מוצאים את אלמנט ה-HTML שרוצים להדפיס
                    const element = document.getElementById(tableId);

                    const options = {
                        margin: 10,
                        filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true }, // scale 2 שומר על חדות הטקסט
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    // הפקה חלקה בעברית כולל עיצוב ה-CSS הקיים!
                    html2pdf().set(options).from(element).save();
                },

                exportFullBackup(format) {
                    const date = new Date().toISOString().split('T')[0];
                    const filename = 'betkneset_backup_' + date;
                    console.log(filename);
                    if (format === 'json') {
                        const txsWithNames = this.transactions.map(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            return { ...t, name: member ? member.name : '', nickname: member ? member.nickname : '' };
                        });
                        const backup = { members: this.members, transactions: txsWithNames, config: this.config, funds: this.funds, paymentPurposes: this.paymentPurposes, exportDate: date };
                        this._downloadFile(JSON.stringify(backup, null, 2), `${filename}.json`, 'application/json');
                        this.recordBackupEvent();
                    } else if (format === 'excel') {
                        const wb = XLSX.utils.book_new();
                        const membersWs = XLSX.utils.json_to_sheet(this.members);
                        XLSX.utils.book_append_sheet(wb, membersWs, 'מתפללים');
                        const oblWs = XLSX.utils.json_to_sheet(this.transactions.filter(t => t.transactionType === 'commitments'));
                        XLSX.utils.book_append_sheet(wb, oblWs, 'התחייבויות');
                        const payWs = XLSX.utils.json_to_sheet(this.transactions.filter(t => t.transactionType === 'payments'));
                        XLSX.utils.book_append_sheet(wb, payWs, 'תשלומים');
                        XLSX.writeFile(wb, `${filename}.xlsx`);
                    } else if (format === 'batch') {
                        const text = this._toBatchText(this.transactions);
                        this._downloadFile(text, `${filename}.txt`, 'text/plain');
                    }
                },

                exportFiltered(format) {
                    const txs = this._getFilteredTransactions();
                    const date = new Date().toISOString().split('T')[0];
                    if (format === 'json') {
                        const txsWithNames = txs.map(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            return { ...t, name: member ? member.name : '', nickname: member ? member.nickname : '' };
                        });
                        const out = { transactions: txsWithNames, exportDate: date };
                        this._downloadFile(JSON.stringify(out, null, 2), `export_filtered_${date}.json`, 'application/json');
                    } else if (format === 'excel') {
                        const wb = XLSX.utils.book_new();
                        const rows = txs.map(t => {
                            const member = this.members.find(m => m.memberUniqueId === t.memberId);
                            return { ...t, memberName: member ? member.name : t.memberId };
                        });
                        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'תנועות');
                        XLSX.writeFile(wb, `export_filtered_${date}.xlsx`);
                    } else if (format === 'batch') {
                        const text = this._toBatchText(txs);
                        this._downloadFile(text, `export_filtered_${date}.txt`, 'text/plain');
                    }
                },

                async restoreFullBackup(inputId = 'restoreFileInput') {
                    const fileInput = document.getElementById(inputId);
                    if (!fileInput || !fileInput.files[0]) { Swal.fire('שגיאה', 'נא לבחור קובץ', 'error'); return; }
                    const result = await Swal.fire({
                        title: 'האם לשחזר מגיבוי?',
                        text: 'כל הנתונים הקיימים בבסיס הנתונים (לא רק על המסך) יימחקו ויוחלפו מיידית!',
                        icon: 'warning', showCancelButton: true, confirmButtonText: 'כן, שחזר', cancelButtonText: 'ביטול', confirmButtonColor: '#dc3545'
                    });
                    if (!result.isConfirmed) return;
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const backup = JSON.parse(e.target.result);
                            Swal.fire({ title: 'משחזר ושומר בבסיס הנתונים...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                            const saves = [];
                            if (backup.members) { this.members = backup.members; saves.push(this.saveMembersData()); }
                            if (backup.transactions) { this.transactions = backup.transactions; saves.push(this.saveTransactionsData()); }
                            if (backup.config) { this.config = { ...backup.config, googleDrive: this.config.googleDrive }; if (!this.config.googleDrive) this.config.googleDrive = { clientId: '', folderId: '', folderName: 'גיבויי בית הכנסת' }; saves.push(this.saveConfigData()); }
                            if (backup.funds) { this.funds = backup.funds; saves.push(this.saveFunds()); }
                            if (backup.paymentPurposes) { this.paymentPurposes = backup.paymentPurposes; saves.push(this.savePaymentPurposes()); }

                            // ממתינים בפועל לכתיבה ל-Firestore — כך שהשחזור מוודא שהנתונים
                            // בבסיס הנתונים עצמו הוחלפו, ולא רק התצוגה המקומית באתר.
                            await Promise.all(saves);

                            this.recordRestoreEvent();
                            this.extractAvailablePurposes();
                            this.renderTable();

                            Swal.fire({ icon: 'success', title: 'שחזור הושלם ונשמר בבסיס הנתונים!', text: `${(backup.members || []).length} מתפללים, ${(backup.transactions || []).length} תנועות`, timer: 3000 });
                            fileInput.value = '';
                        } catch (err) {
                            Swal.fire('שגיאה', 'קובץ לא תקין: ' + err.message, 'error');
                        }
                    };
                    reader.readAsText(file);
                },

                importFromJson() {
                    const fileInput = document.getElementById('importJsonFile');
                    if (!fileInput || !fileInput.files[0]) { Swal.fire('שגיאה', 'נא לבחור קובץ', 'error'); return; }
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = JSON.parse(e.target.result);
                            const txsToImport = data.transactions || data;
                            let addedTx = 0, addedMem = 0;
                            // Import members if present
                            (data.members || []).forEach(m => {
                                if (!this.members.some(ex => ex.memberUniqueId === m.memberUniqueId)) {
                                    this.members.push(m); addedMem++;
                                }
                            });
                            // Import transactions (avoid duplicates by transactionId)
                            (Array.isArray(txsToImport) ? txsToImport : []).forEach(t => {
                                if (!this.transactions.some(ex => ex.transactionId === t.transactionId)) {
                                    this.transactions.unshift(t); addedTx++;
                                }
                            });
                            if (addedMem) this.saveMembersData();
                            if (addedTx) this.saveTransactionsData();
                            Swal.fire({ icon: 'success', title: 'ייבוא הושלם', text: `נוספו ${addedTx} תנועות ו-${addedMem} מתפללים`, timer: 3000 });
                            fileInput.value = '';
                        } catch (err) { Swal.fire('שגיאה', 'קובץ לא תקין: ' + err.message, 'error'); }
                    };
                    reader.readAsText(file);
                },

                importFromExcel() {
                    const fileInput = document.getElementById('importExcelFile');
                    if (!fileInput || !fileInput.files[0]) { Swal.fire('שגיאה', 'נא לבחור קובץ', 'error'); return; }
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const wb = XLSX.read(e.target.result, { type: 'array' });
                            let addedTx = 0;
                            wb.SheetNames.forEach(sheetName => {
                                const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
                                rows.forEach((row, idx) => {
                                    const type = row.transactionType || (sheetName.includes('התחייב') ? 'commitments' : sheetName.includes('תשלום') ? 'payments' : null);
                                    if (!type) return;
                                    const memberId = row.memberId || (row.memberName ? (this.members.find(m => m.name === row.memberName) || {}).memberUniqueId : null);
                                    if (!memberId) return;
                                    const t = { ...row, transactionId: row.transactionId || (Date.now() + idx), transactionType: type, memberId };
                                    if (!this.transactions.some(ex => ex.transactionId === t.transactionId)) {
                                        this.transactions.unshift(t); addedTx++;
                                    }
                                });
                            });
                            if (addedTx) this.saveTransactionsData();
                            Swal.fire({ icon: 'success', title: 'ייבוא הושלם', text: `נוספו ${addedTx} תנועות`, timer: 3000 });
                            fileInput.value = '';
                        } catch (err) { Swal.fire('שגיאה', 'שגיאה בקריאת Excel: ' + err.message, 'error'); }
                    };
                    reader.readAsArrayBuffer(fileInput.files[0]);
                },

                importFromBatch() {
                    if (!this.ieBatchText.trim()) { Swal.fire('שגיאה', 'נא להזין טקסט', 'error'); return; }
                    const lines = this.ieBatchText.split('\n');
                    let currentType = null;
                    let addedCount = 0;
                    const errors = [];
                    lines.forEach((line, li) => {
                        const trimmed = line.trim();
                        if (!trimmed) return;
                        if (trimmed === 'commitments' || trimmed === 'payments') { currentType = trimmed; return; }
                        if (!currentType) { errors.push(`שורה ${li + 1}: חסר כותרת (commitments/payments)`); return; }
                        const cols = currentType === 'commitments' ? this.config.commitmentColumns : this.config.paymentColumns;
                        const values = trimmed.split(',').map(v => v.trim());
                        if (!values[0]) return;
                        const member = this.members.find(m => m.memberUniqueId === values[0] || m.name === values[0] || m.name.toLowerCase() === values[0].toLowerCase());
                        if (!member) { errors.push(`שורה ${li + 1}: מתפלל "${values[0]}" לא נמצא`); return; }
                        const transaction = { transactionId: Date.now() + li + Math.random(), memberId: member.memberUniqueId, transactionType: currentType };
                        cols.forEach((col, i) => { transaction[col.field] = (values[i + 1] || '').trim() || (col.type === 'date' ? this.getTodayDate() : ''); });
                        const amountField = currentType === 'commitments' ? 'commitmentAmount' : 'paymentAmount';
                        if (!transaction[amountField]) { errors.push(`שורה ${li + 1}: חסר סכום`); return; }
                        this.transactions.unshift(transaction);
                        addedCount++;
                    });
                    if (addedCount > 0) { this.saveTransactionsData(); this.ieBatchText = ''; }
                    if (errors.length > 0) Swal.fire({ icon: addedCount > 0 ? 'warning' : 'error', title: `נוספו ${addedCount} תנועות`, html: errors.join('<br>') });
                    else if (addedCount > 0) Swal.fire({ icon: 'success', title: 'ייבוא הושלם', text: `נוספו ${addedCount} תנועות`, timer: 2000, showConfirmButton: false });
                },

                renderHomePage() {
                    if (this.currentTable) { try { this.currentTable.destroy(); } catch (e) { } this.currentTable = null; }
                    this.filterHomeTransactions();
                    const search = (this.homeSearch || '').toLowerCase();
                    const displayData = this.filteredHomeTransactions.slice(0, 50).map(t => {
                        const member = this.members.find(m => m.memberUniqueId === t.memberId);
                        return { ...t, memberName: member ? member.name : 'לא ידוע', date: t.commitmentDate || t.paymentDate || '', amount: t.commitmentAmount || t.paymentAmount || 0, typeLabel: t.transactionType === 'commitments' ? 'התחייבות' : 'תשלום' };
                    }).filter(row => !search || (row.memberName || '').toLowerCase().includes(search) || (row.purpose || '').toLowerCase().includes(search));
                    const columns = [
                        { title: "תאריך", field: "date", responsive: 0, width: 120, formatter: (cell) => formatDate(cell.getValue()) },
                        { title: "מתפלל", field: "memberName", responsive: 0, widthGrow: 2 },
                        { title: "סוג", field: "typeLabel", responsive: 1, width: 120 },
                        { title: "מטרה", field: "purpose", responsive: 2, widthGrow: 1 },
                        {
                            title: "סכום", field: "amount", formatter: (cell) => {
                                const row = cell.getRow().getData();
                                const isCommitment = row.transactionType === 'commitments';
                                return isCommitment ? commitmentFmt(cell) : paymentFmt(cell);
                            }, responsive: 0, width: 120
                        }
                    ];
                    if (!this.readOnlyMode) {
                        columns.push({ title: 'עבור אל', field: 'goto', width: 70, headerSort: false, responsive: 0, formatter: () => '<span class="goto-btn" title="עבור לתנועה">➜</span>', cellClick: (e, cell) => { const data = cell.getRow().getData(); this.goToMemberTransaction(data.memberId, data.transactionId); } });
                        columns.push({ title: 'מחק', field: 'delete', width: 65, headerSort: false, responsive: 0, formatter: () => '<span class="delete-btn" title="מחק"><i class="fa fa-trash" aria-hidden="true"></i></span>', cellClick: (e, cell) => { this.deleteTransaction(cell.getRow().getData().transactionId); } });
                    }
                    const container = document.getElementById('homeTable');
                    if (container) container.innerHTML = '';
                    setTimeout(() => {
                        this.currentTable = new Tabulator("#homeTable", {
                            data: displayData,
                            layout: this.getTableScroll("home") ? "fitData" : "fitColumns",
                            responsiveLayout: this.getTableScroll("home") ? false : "collapse", placeholder: "אין נתונים להצגה",
                            pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200], columns
                        });
                        const wrapper = document.getElementById('homeTable');
                        if (wrapper) wrapper.classList.toggle('scrollable', this.getTableScroll("home"));
                        this.renderDebtorsTable();
                    }, 50);
                },

                renderDebtorsTable() {
                    if (this.debtorsTable) { try { this.debtorsTable.destroy(); } catch (e) { } this.debtorsTable = null; }
                    const search = (this.debtorsSearch || '').toLowerCase();
                    const debtorsData = this.members.map(m => {
                        const bal = this.getMemberBalance(m.memberUniqueId);
                        return { name: m.name, memberUniqueId: m.memberUniqueId, balance: bal };
                    }).filter(d => d.balance > 0 && (!search || (d.name || '').toLowerCase().includes(search))).sort((a, b) => b.balance - a.balance);
                    const container = document.getElementById('debtorsTable');
                    if (container) container.innerHTML = '';
                    setTimeout(() => {
                        this.debtorsTable = new Tabulator("#debtorsTable", {
                            data: debtorsData,
                            layout: this.getTableScroll("debtors") ? "fitData" : "fitColumns",
                            responsiveLayout: this.getTableScroll("debtors") ? false : "collapse",
                            placeholder: "אין נתונים להצגה",
                            pagination: "local", paginationSize: 100, paginationSizeSelector: [20, 50, 100, 200],
                            columns: [
                                { title: "שם", field: "name", widthGrow: 2, responsive: 0, cellClick: (e, cell) => { const data = cell.getRow().getData(); const member = this.members.find(m => m.memberUniqueId === data.memberUniqueId); if (member) this.selectMember(member); } },
                                { title: "חובה", field: "balance", bottomCalc: "sum", responsive: 0, formatter: (cell) => { const v = cell.getValue(); cell.getElement().style.color = '#dc3545'; cell.getElement().style.fontWeight = '600'; cell.getElement().style.direction = 'ltr'; return '₪' + Number(v).toLocaleString(); } }
                            ]
                        });
                        const wrapper = document.getElementById('debtorsTable');
                        if (wrapper) wrapper.classList.toggle('scrollable', this.getTableScroll("debtors"));
                    }, 100);
                },

                renderGlobalSummary() {
                    if (this.currentTable) { try { this.currentTable.destroy(); } catch (e) { } this.currentTable = null; }
                    const search = (this.summarySearch || '').toLowerCase();
                    const summaryData = this.members.map(m => {
                        const memberTransactions = this.transactions.filter(t => t.memberId === m.memberUniqueId);
                        const balance = memberTransactions.reduce((sum, t) => {
                            const amount = Number(t.commitmentAmount || t.paymentAmount || 0);
                            return sum + (t.transactionType === 'payments' ? amount : -amount);
                        }, 0);
                        return { name: m.name, memberUniqueId: m.memberUniqueId, balance, isFund: false };
                    });

                    // ═══ קופות: מוצגות בסיכום כמו מתפלל רגיל, יתרת הקופה במקום יתרת חוב ═══
                    const fundRows = this.funds.map(fnd => ({
                        name: '🏦 ' + fnd.name,
                        memberUniqueId: 'fund_' + fnd.id,
                        balance: Number(fnd.balance) || 0,
                        isFund: true,
                        fundId: fnd.id
                    }));

                    const combined = [...summaryData, ...fundRows]
                        .filter(d => !search || (d.name || '').toLowerCase().includes(search));

                    const container = document.getElementById('summaryTable');
                    if (container) container.innerHTML = '';
                    setTimeout(() => {
                        //סיכום חובות כללי
                        this.currentTable = new Tabulator("#summaryTable", {
                            data: combined,
                            layout: this.getTableScroll("summary") ? "fitData" : "fitColumns",
                            responsiveLayout: this.getTableScroll("summary") ? false : "collapse",
                            placeholder: "אין נתונים להצגה",
                            pagination: "local", paginationSize: 400, paginationSizeSelector: [50, 100, 200, 400],
                            columns: [
                                {
                                    title: "שם", field: "name", widthGrow: 2, responsive: 0,
                                    cellClick: (e, cell) => {
                                        if (this.readOnlyMode) return;
                                        const data = cell.getRow().getData();
                                        if (data.isFund) {
                                            this.navigate('funds');
                                            this.$nextTick(() => this.selectFund(data.fundId));
                                        } else {
                                            const member = this.members.find(m => m.memberUniqueId === data.memberUniqueId);
                                            if (member) this.selectMember(member);
                                        }
                                    }
                                },
                                {
                                    title: "חוב / יתרה", field: "balance", formatter: this.summaryColorMode ? (cell) => {
                                        const v = cell.getValue();
                                        const num = Number(v) || 0;
                                        cell.getElement().style.direction = 'ltr';
                                        if (num > 0) { cell.getElement().style.color = '#28a745'; cell.getElement().style.fontWeight = '600'; }
                                        else if (num < 0) { cell.getElement().style.color = '#dc3545'; cell.getElement().style.fontWeight = '600'; }
                                        else { cell.getElement().style.color = ''; cell.getElement().style.fontWeight = ''; }
                                        return '₪' + num.toLocaleString();
                                    } : moneyFmt, bottomCalc: "sum", responsive: 0
                                }
                            ]
                        });
                        const wrapper = document.getElementById('summaryTable');
                        if (wrapper) wrapper.classList.toggle('scrollable', this.getTableScroll("summary"));
                    }, 50);
                },
				
				
                // ═══ FUNDS MANAGEMENT ═══

                // הערה: קופות (funds) נטענות אך ורק מ-Firestore (ב-_loadFromFirestore) או מנתוני
                // הדגמה במצב DEMO. הפונקציה נשמרת ריקה למקרה שקוד ישן עדיין קורא לה.
                initFunds() { },

                saveFunds() {
                    return this._saveToFirestore('funds', { list: this.funds });
                },

                // ═══ PAYMENT PURPOSES MANAGEMENT — מטרות תשלום (רשימה גלובלית, משותפת לכל הקופות) ═══
                initPaymentPurposes() { },

                savePaymentPurposes() {
                    return this._saveToFirestore('paymentPurposes', { list: this.paymentPurposes });
                },

                addPurpose() {
                    if (!this.newPurposeName.trim()) {
                        Swal.fire('שגיאה', 'נא להזין שם מטרת תשלום', 'error');
                        return;
                    }
                    if (this.paymentPurposes.some(p => p.name.toLowerCase() === this.newPurposeName.trim().toLowerCase())) {
                        Swal.fire('שגיאה', 'מטרת תשלום בשם זה כבר קיימת', 'error');
                        return;
                    }
                    const purpose = {
                        id: Date.now().toString(),
                        name: this.newPurposeName.trim(),
                        startDate: this.newPurposeStartDate || this.getTodayDate(),
                        notes: this.newPurposeNotes.trim(),
                        createdAt: this.getTodayDate()
                    };
                    this.paymentPurposes.push(purpose);
                    this.savePaymentPurposes();
                    this.newPurposeName = '';
                    this.newPurposeNotes = '';
                    this.newPurposeStartDate = '';
                    this.showAddPurposeForm = false;
                    Swal.fire('הצלחה', 'מטרת התשלום נוספה בהצלחה', 'success');
                },

                deletePurpose(purposeId) {
                    const purpose = this.paymentPurposes.find(p => p.id === purposeId);
                    if (!purpose) return;

                    Swal.fire({
                        title: `מחיקת מטרת תשלום: ${purpose.name}`,
                        text: `מחיקה תסיר את מטרת התשלום מהרשימה. פעולות ניצול קודמות שכבר בוצעו אליה יישארו בהיסטוריית הקופות, אך לא ניתן יהיה לבחור אותה עוד בפעולות חדשות.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'מחק',
                        cancelButtonText: 'ביטול'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.paymentPurposes = this.paymentPurposes.filter(p => p.id !== purposeId);
                            this.savePaymentPurposes();
                            if (this.selectedPurpose?.id === purposeId) {
                                this.selectedPurpose = null;
                            }
                            Swal.fire('הצלחה', 'מטרת התשלום נמחקה', 'success');
                        }
                    });
                },

                selectPurpose(purposeId) {
                    this.selectedPurpose = this.paymentPurposes.find(p => p.id === purposeId) || null;
                    this.purposeRangeFrom = this.selectedPurpose ? this.selectedPurpose.startDate : '';
                    this.purposeRangeTo = this.getTodayDate();
                },

                startEditPurpose(purposeId) {
                    const purpose = this.paymentPurposes.find(p => p.id === purposeId);
                    if (purpose) {
                        this.purposeEditingId = purposeId;
                        this.purposeEditingName = purpose.name;
                        this.purposeEditingNotes = purpose.notes;
                        this.purposeEditingStartDate = purpose.startDate;
                    }
                },

                cancelEditPurpose() {
                    this.purposeEditingId = null;
                    this.purposeEditingName = '';
                    this.purposeEditingNotes = '';
                    this.purposeEditingStartDate = '';
                },

                saveEditPurpose() {
                    if (!this.purposeEditingName.trim()) {
                        Swal.fire('שגיאה', 'נא להזין שם מטרת תשלום', 'error');
                        return;
                    }
                    const purpose = this.paymentPurposes.find(p => p.id === this.purposeEditingId);
                    if (!purpose) return;

                    if (this.purposeEditingName.toLowerCase() !== purpose.name.toLowerCase() &&
                        this.paymentPurposes.some(p => p.name.toLowerCase() === this.purposeEditingName.trim().toLowerCase())) {
                        Swal.fire('שגיאה', 'מטרת תשלום בשם זה כבר קיימת', 'error');
                        return;
                    }

                    purpose.name = this.purposeEditingName.trim();
                    purpose.notes = this.purposeEditingNotes.trim();
                    purpose.startDate = this.purposeEditingStartDate || purpose.startDate;
                    this.savePaymentPurposes();
                    this.purposeEditingId = null;
                    this.purposeEditingName = '';
                    this.purposeEditingNotes = '';
                    this.purposeEditingStartDate = '';
                    if (this.selectedPurpose?.id === purpose.id) {
                        this.selectedPurpose = { ...purpose };
                    }
                    Swal.fire('הצלחה', 'מטרת התשלום עודכנה', 'success');
                },

                // בונה רשימת <option> למטרות תשלום, למיון בסדר א-ב, עם אפשרות לסמן ID נבחר מראש
                getPurposeOptionsHtml(selectedId = '') {
                    const sorted = [...this.paymentPurposes].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'he'));
                    let html = `<option value="">בחר מטרת תשלום...</option>`;
                    sorted.forEach(p => {
                        const sel = String(p.id) === String(selectedId) ? 'selected' : '';
                        html += `<option value="${p.id}" ${sel}>${this.escapeHtml(p.name)}</option>`;
                    });
                    return html;
                },

                // כל פעולות ה"ניצול כסף" מכל הקופות שמקושרות למטרת תשלום נתונה (מקור האמת היחיד — נגזר מהיסטוריית הקופות)
                getPurposeHistoryRows(purposeId) {
                    const rows = [];
                    this.funds.forEach(fund => {
                        (fund.history || []).forEach(h => {
                            if (h.type === 'reduction' && h.purposeId === purposeId) {
                                rows.push({
                                    id: h.id,
                                    date: h.date || '',
                                    amount: Number(h.amount) || 0,
                                    fundName: fund.name,
                                    details: h.details || ''
                                });
                            }
                        });
                    });
                    return rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
                },

                // סכום מצטבר של מטרת תשלום בטווח תאריכים (ברירת מחדל: מתאריך ההתחלה ועד היום)
                getPurposeCumulative(purposeId, fromDate, toDate) {
                    return this.getPurposeHistoryRows(purposeId)
                        .filter(r => (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate))
                        .reduce((sum, r) => sum + r.amount, 0);
                },

                // ═══ היסטוריית גיבוי/שחזור — שומרים את 5 האחרונים בלבד ═══
                _nowLabel() {
                    const now = new Date();
                    return now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL');
                },

                _saveBackupMeta() {
                    this._saveToFirestore('backupMeta', { backups: this.backupHistory, restores: this.restoreHistory });
                },
                clearBackupHistory() {
                    Swal.fire({
                        title: 'לנקות את היסטוריית הגיבויים?',
                        text: 'פעולה זו תמחק את רשימת תאריכי הגיבויים האחרונים בלבד (קבצי הגיבוי עצמם אינם נמחקים)',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'כן, נקה',
                        cancelButtonText: 'ביטול',
                        confirmButtonColor: '#dc3545'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.backupHistory = [];
                            this._saveBackupMeta();
                            Swal.fire({
                                icon: 'success',
                                title: 'היסטוריית הגיבויים נוקתה!',
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    });
                },
                clearRestoreHistory() {
                    Swal.fire({
                        title: 'לנקות את היסטוריית השחזורים?',
                        text: 'פעולה זו תמחק את רשימת תאריכי השחזורים האחרונים בלבד',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'כן, נקה',
                        cancelButtonText: 'ביטול',
                        confirmButtonColor: '#dc3545'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.restoreHistory = [];
                            this._saveBackupMeta();
                            Swal.fire({
                                icon: 'success',
                                title: 'היסטוריית השחזורים נוקתה!',
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 1500
                            });
                        }
                    });
                },
                recordBackupEvent() {
                    this.backupHistory.unshift({ time: this._nowLabel() });
                    if (this.backupHistory.length > 5) this.backupHistory = this.backupHistory.slice(0, 5);
                    this._saveBackupMeta();
                },
                recordRestoreEvent() {
                    this.restoreHistory.unshift({ time: this._nowLabel() });
                    if (this.restoreHistory.length > 5) this.restoreHistory = this.restoreHistory.slice(0, 5);
                    this._saveBackupMeta();
                },
                get lastBackupTime() {
                    return this.backupHistory.length ? this.backupHistory[0].time : null;
                },
                get lastRestoreTime() {
                    return this.restoreHistory.length ? this.restoreHistory[0].time : null;
                },

                // ═══════════════════════ Google Drive Backup Integration ═══════════════════════
                // בונה את תוכן הגיבוי (JSON) כמחרוזת - בשימוש גם לייצוא רגיל וגם לגיבוי לדרייב
                _buildBackupJsonString() {
                    const date = new Date().toISOString().split('T')[0];
                    const txsWithNames = this.transactions.map(t => {
                        const member = this.members.find(m => m.memberUniqueId === t.memberId);
                        return { ...t, name: member ? member.name : '', nickname: member ? member.nickname : '' };
                    });
                    const backup = { members: this.members, transactions: txsWithNames, config: this.config, funds: this.funds, paymentPurposes: this.paymentPurposes, exportDate: date };
                    return JSON.stringify(backup, null, 2);
                },

                _loadGoogleIdentityScript() {
                    return new Promise((resolve, reject) => {
                        if (window.google && window.google.accounts && window.google.accounts.oauth2) { this._gisLoaded = true; resolve(); return; }
                        let script = document.getElementById('gis-script');
                        if (!script) {
                            script = document.createElement('script');
                            script.id = 'gis-script';
                            script.src = 'https://accounts.google.com/gsi/client';
                            script.async = true;
                            script.defer = true;
                            document.head.appendChild(script);
                        }
                        script.addEventListener('load', () => { this._gisLoaded = true; resolve(); });
                        script.addEventListener('error', () => { script.remove(); reject(new Error('טעינת ספריית Google נכשלה')); });
                    });
                },

                _validDriveClientId() {
                    const clientId = (this.effectiveGoogleClientId || '').replace(/[\s'"]/g, '');
                    if (!clientId) throw new Error('חיבור הדרייב עדיין לא הוגדר באתר. יש לפנות למפתח.');
                    if (!/^\d{6,}-[a-z0-9]{20,}\.apps\.googleusercontent\.com$/i.test(clientId)) throw new Error('Client ID לא תקין: ' + clientId);
                    return clientId;
                },

                // יוצר (פעם אחת) את לקוח ה-OAuth של גוגל. התוצאה של כל בקשת טוקן מגיעה דרך _drivePending
                async _ensureDriveTokenClient() {
                    const clientId = this._validDriveClientId();
                    await this._loadGoogleIdentityScript();
                    if (!this.googleDriveTokenClient || this._driveClientIdUsed !== clientId) {
                        this._driveClientIdUsed = clientId;
                        this.googleDriveTokenClient = google.accounts.oauth2.initTokenClient({
                            client_id: clientId,
                            scope: 'https://www.googleapis.com/auth/drive.file',
                            callback: (resp) => {
                                const p = this._drivePending; this._drivePending = null;
                                if (!p) return;
                                if (resp.error) p.reject(new Error(resp.error_description || resp.error)); else p.resolve(resp);
                            },
                            // נקרא כשהחלון נחסם / נסגר ע"י המשתמש - בלעדיו ההבטחה הייתה נתקעת לנצח
                            error_callback: (err) => {
                                const p = this._drivePending; this._drivePending = null;
                                if (p) p.reject(new Error((err && err.type) || 'popup_error'));
                            }
                        });
                    }
                    return this.googleDriveTokenClient;
                },

                // prompt: 'none' = שקט לחלוטין (נכשל אם נדרשת אינטראקציה); '' = מציג חלון רק אם צריך; 'select_account consent' = חיבור ראשון
                async _requestDriveToken(prompt, timeoutMs = 0) {
                    const client = await this._ensureDriveTokenClient();
                    const hint = this.config?.googleDrive?.userEmail || this.googleDriveUserEmail || '';
                    const resp = await new Promise((resolve, reject) => {
                        let timer = null;
                        const done = (fn) => (v) => { if (timer) clearTimeout(timer); fn(v); };
                        this._drivePending = { resolve: done(resolve), reject: done(reject) };
                        if (timeoutMs) timer = setTimeout(() => { this._drivePending = null; reject(new Error('timeout')); }, timeoutMs);
                        const opts = { prompt };
                        if (hint && prompt !== 'select_account consent') opts.hint = hint;
                        client.requestAccessToken(opts);
                    });
                    this._setDriveToken(resp.access_token, resp.expires_in);
                    return resp.access_token;
                },

                _setDriveToken(token, expiresIn) {
                    this.googleDriveAccessToken = token;
                    this._driveTokenExpiry = Date.now() + (Number(expiresIn) || 3600) * 1000 - 60000;
                    this.googleDriveConnected = true;
                    this.googleDriveNeedsClick = false;
                    // נשמר ב-sessionStorage בלבד (נמחק עם סגירת הלשונית) כדי לשרוד רענון דף בלי לבקש חיבור מחדש
                    try {
                        sessionStorage.setItem('drv_tok', JSON.stringify({ t: token, e: this._driveTokenExpiry, uid: window.auth?.currentUser?.uid || '' }));
                    } catch (e) { }
                },

                _restoreDriveTokenFromSession() {
                    try {
                        const o = JSON.parse(sessionStorage.getItem('drv_tok') || 'null');
                        if (o && o.t && o.e > Date.now() && o.uid && o.uid === window.auth?.currentUser?.uid) {
                            this.googleDriveAccessToken = o.t;
                            this._driveTokenExpiry = o.e;
                            this.googleDriveConnected = true;
                            return true;
                        }
                    } catch (e) { }
                    return false;
                },

                _clearDriveSession() {
                    try { sessionStorage.removeItem('drv_tok'); } catch (e) { }
                    this.googleDriveAccessToken = '';
                    this._driveTokenExpiry = 0;
                    this.googleDriveConnected = false;
                    this.googleDriveNeedsClick = false;
                    this.googleDriveFiles = [];
                    this.googleDriveUserEmail = '';
                    this._driveAutoTried = false;
                },

                // אחרי שיש טוקן: מזהה את החשבון, מעדכן את הקונפיג המשותף (Firestore), ומוצא את תיקיית הגיבויים
                async _afterDriveConnected() {
                    if (!this.config.googleDrive) this.config.googleDrive = { clientId: '', folderId: '', folderName: 'גיבויי בית הכנסת' };
                    const gd = this.config.googleDrive;
                    try {
                        const about = await this._driveFetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress,displayName)');
                        this.googleDriveUserEmail = about?.user?.emailAddress || '';
                    } catch (e) { /* לא קריטי */ }
                    let changed = false;
                    if (!gd.connectedOnce) { gd.connectedOnce = true; changed = true; }
                    const email = this.googleDriveUserEmail;
                    if (email) {
                        // חשבון גוגל אחר מזה ששמור -> התיקייה השמורה שייכת לדרייב אחר, מחפשים/יוצרים תיקייה בדרייב הנוכחי
                        if (gd.userEmail && gd.userEmail !== email && gd.folderId) { gd.folderId = ''; changed = true; }
                        if (gd.userEmail !== email) { gd.userEmail = email; changed = true; }
                    }
                    if (changed) this.saveConfigData();
                    await this.ensureGoogleDriveFolder();
                    await this.listGoogleDriveBackups();
                },

                // נקרא אוטומטית אחרי טעינת הנתונים: אם כבר חיברו את הדרייב (מכל מכשיר) - מחברים גם כאן
                async autoReconnectGoogleDrive() {
                    if (window.IS_DEMO || this.googleDriveConnected || this._driveAutoTried) return;
                    if (!this.config?.googleDrive?.connectedOnce) return;
                    this._driveAutoTried = true;
                    this._loadGoogleIdentityScript().catch(() => { });   // טעינה מוקדמת, כדי שהלחיצה הבאה תהיה מיידית
                    try {
                        // רק שחזור שקט מהטוקן ששמור בלשונית הזו (בלי חלון גוגל).
                        // כל בקשת טוקן חדשה מגוגל פותחת חלון קופץ, ולכן היא נעשית רק בלחיצה על "התחבר מחדש".
                        if (this._restoreDriveTokenFromSession()) {
                            await this._afterDriveConnected();
                            return;
                        }
                        this.googleDriveNeedsClick = true;
                    } catch (e) {
                        this.googleDriveConnected = false;
                        this.googleDriveNeedsClick = true;
                    }
                },

                async connectGoogleDrive() {
                    this.googleDriveConnecting = true;
                    try {
                        this._validDriveClientId();
                        const firstTime = !this.config?.googleDrive?.connectedOnce;
                        await this._requestDriveToken(firstTime ? 'select_account consent' : '');
                        await this._afterDriveConnected();
                        Swal.fire({ icon: 'success', title: 'החיבור לגוגל דרייב הושלם', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                    } catch (err) {
                        const m = err.message || '';
                        if (m === 'popup_closed' || m === 'access_denied') {
                            Swal.fire({ icon: 'info', title: 'החיבור בוטל', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                        } else if (m === 'popup_failed_to_open') {
                            Swal.fire('החלון נחסם', 'הדפדפן חסם את חלון ההתחברות של גוגל. יש לאפשר חלונות קופצים לאתר ולנסות שוב.', 'warning');
                        } else {
                            Swal.fire('שגיאה בחיבור לגוגל דרייב', m || 'נסה שוב', 'error');
                        }
                    } finally {
                        this.googleDriveConnecting = false;
                    }
                },

                disconnectGoogleDrive() {
                    if (this.googleDriveAccessToken && window.google?.accounts?.oauth2) {
                        try { google.accounts.oauth2.revoke(this.googleDriveAccessToken, () => { }); } catch (e) { }
                    }
                    this._clearDriveSession();
                    // התיקייה שייכת לחשבון הקודם - מנקים כדי שבחיבור הבא (גם לחשבון אחר) תיווצר/תימצא תיקייה בדרייב החדש
                    if (this.config?.googleDrive && (this.config.googleDrive.folderId || this.config.googleDrive.connectedOnce || this.config.googleDrive.userEmail)) {
                        this.config.googleDrive.folderId = '';
                        this.config.googleDrive.connectedOnce = false;
                        this.config.googleDrive.userEmail = '';
                        this.saveConfigData();
                    }
                },

                // עוטף fetch עם הרשאת Bearer, ומחדש טוקן שפג תוקפו (באופן שקט אם אפשר)
                async _driveFetch(url, options = {}) {
                    const refresh = async () => {
                        try { await this._requestDriveToken(''); }
                        catch (e) {
                            this.googleDriveConnected = false;
                            this.googleDriveNeedsClick = true;
                            throw new Error('פג תוקף החיבור לגוגל דרייב. יש ללחוץ "התחבר מחדש" ולנסות שוב.');
                        }
                    };
                    if (!this.googleDriveAccessToken || Date.now() > this._driveTokenExpiry) await refresh();
                    const doFetch = async () => fetch(url, {
                        ...options,
                        headers: { ...(options.headers || {}), Authorization: `Bearer ${this.googleDriveAccessToken}` }
                    });
                    let res = await doFetch();
                    if (res.status === 401) { await refresh(); res = await doFetch(); }
                    if (!res.ok) {
                        let msg = 'שגיאת תקשורת עם גוגל דרייב';
                        try { const j = await res.json(); msg = j.error?.message || msg; } catch (e) { }
                        const err = new Error(msg); err.status = res.status;
                        throw err;
                    }
                    const ct = res.headers.get('content-type') || '';
                    if (ct.includes('application/json')) return res.json();
                    return res.text();
                },

                // מוצא (או יוצר) את תיקיית הגיבויים בדרייב, ושומר את ה-ID בקונפיג המשותף
                async ensureGoogleDriveFolder() {
                    if (this.config.googleDrive.folderId) return this.config.googleDrive.folderId;
                    const folderName = this.config.googleDrive.folderName || 'גיבויי בית הכנסת';
                    const q = encodeURIComponent(`name='${folderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
                    const listRes = await this._driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
                    if (listRes.files && listRes.files.length > 0) {
                        this.config.googleDrive.folderId = listRes.files[0].id;
                    } else {
                        const created = await this._driveFetch('https://www.googleapis.com/drive/v3/files', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: folderName, mimeType: 'application/vnd.google-apps.folder' })
                        });
                        this.config.googleDrive.folderId = created.id;
                    }
                    this.saveConfigData();
                    return this.config.googleDrive.folderId;
                },

                async backupToGoogleDrive() {
                    if (!this.googleDriveConnected) { Swal.fire('שגיאה', 'יש להתחבר לגוגל דרייב קודם (בהגדרות)', 'error'); return; }
                    this.googleDriveBackingUp = true;
                    try {
                        const folderId = await this.ensureGoogleDriveFolder();
                        const date = new Date().toISOString().split('T')[0];
                        const time = new Date().toTimeString().slice(0, 5).replace(':', '-');
                        const filename = `betkneset_backup_${date}_${time}.json`;
                        const content = this._buildBackupJsonString();
                        const metadata = { name: filename, parents: [folderId], mimeType: 'application/json' };
                        const boundary = '-------betkneset' + Date.now();
                        const body =
                            `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
                            `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n` +
                            `--${boundary}--`;
                        await this._driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,size', {
                            method: 'POST',
                            headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
                            body
                        });
                        this.recordBackupEvent();
                        await this.listGoogleDriveBackups();
                        Swal.fire({ icon: 'success', title: 'הגיבוי הועלה לגוגל דרייב!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
                    } catch (err) {
                        Swal.fire('שגיאה בגיבוי לדרייב', err.message || 'נסה שוב', 'error');
                    } finally {
                        this.googleDriveBackingUp = false;
                    }
                },

                async listGoogleDriveBackups() {
                    if (!this.googleDriveConnected) return;
                    this.googleDriveLoadingFiles = true;
                    try {
                        const listIn = async (folderId) => {
                            const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
                            return this._driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)&pageSize=100`);
                        };
                        let folderId = await this.ensureGoogleDriveFolder();
                        let res;
                        try { res = await listIn(folderId); }
                        catch (e) {
                            // התיקייה השמורה נמחקה / שייכת לחשבון אחר -> מאתרים או יוצרים מחדש פעם אחת
                            if (e.status !== 404 && e.status !== 403) throw e;
                            this.config.googleDrive.folderId = '';
                            folderId = await this.ensureGoogleDriveFolder();
                            res = await listIn(folderId);
                        }
                        this.googleDriveFiles = (res.files || []);
                    } catch (err) {
                        Swal.fire('שגיאה בטעינת רשימת הגיבויים', err.message || 'נסה שוב', 'error');
                    } finally {
                        this.googleDriveLoadingFiles = false;
                    }
                },

                async restoreFromGoogleDrive(fileId, fileName) {
                    if (this.readOnlyMode) { Swal.fire('שגיאה', 'מצב קריאה בלבד', 'error'); return; }
                    const result = await Swal.fire({
                        title: 'לשחזר מגיבוי זה?',
                        html: `כל הנתונים הקיימים בבסיס הנתונים יימחקו ויוחלפו בגיבוי:<br><b>${this.escapeHtml(fileName || '')}</b>`,
                        icon: 'warning', showCancelButton: true, confirmButtonText: 'כן, שחזר', cancelButtonText: 'ביטול', confirmButtonColor: '#dc3545'
                    });
                    if (!result.isConfirmed) return;
                    try {
                        Swal.fire({ title: 'משחזר ושומר בבסיס הנתונים...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                        const content = await this._driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
                        const backup = typeof content === 'string' ? JSON.parse(content) : content;
                        const saves = [];
                        if (backup.members) { this.members = backup.members; saves.push(this.saveMembersData()); }
                        if (backup.transactions) { this.transactions = backup.transactions; saves.push(this.saveTransactionsData()); }
                        if (backup.config) { this.config = { ...backup.config, googleDrive: this.config.googleDrive }; if (!this.config.googleDrive) this.config.googleDrive = { clientId: '', folderId: '', folderName: 'גיבויי בית הכנסת' }; saves.push(this.saveConfigData()); }
                        if (backup.funds) { this.funds = backup.funds; saves.push(this.saveFunds()); }
                        if (backup.paymentPurposes) { this.paymentPurposes = backup.paymentPurposes; saves.push(this.savePaymentPurposes()); }
                        await Promise.all(saves);
                        this.recordRestoreEvent();
                        this.extractAvailablePurposes();
                        this.renderTable();
                        Swal.fire({ icon: 'success', title: 'שחזור הושלם ונשמר בבסיס הנתונים!', text: `${(backup.members || []).length} מתפללים, ${(backup.transactions || []).length} תנועות`, timer: 3000 });
                    } catch (err) {
                        Swal.fire('שגיאה בשחזור', err.message || 'קובץ לא תקין', 'error');
                    }
                },

                async deleteGoogleDriveBackup(fileId, fileName) {
                    const result = await Swal.fire({
                        title: 'למחוק גיבוי זה מהדרייב?',
                        html: `<b>${this.escapeHtml(fileName || '')}</b><br>לא ניתן לשחזר פעולה זו.`,
                        icon: 'warning', showCancelButton: true, confirmButtonText: 'מחק', cancelButtonText: 'ביטול', confirmButtonColor: '#dc3545'
                    });
                    if (!result.isConfirmed) return;
                    try {
                        await this._driveFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, { method: 'DELETE' });
                        this.googleDriveFiles = this.googleDriveFiles.filter(f => f.id !== fileId);
                        Swal.fire({ icon: 'success', title: 'הגיבוי נמחק', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                    } catch (err) {
                        Swal.fire('שגיאה במחיקה', err.message || 'נסה שוב', 'error');
                    }
                },

                formatDriveFileSize(bytes) {
                    const n = Number(bytes) || 0;
                    if (n < 1024) return n + ' B';
                    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
                    return (n / (1024 * 1024)).toFixed(1) + ' MB';
                },

                formatDriveFileDate(iso) {
                    if (!iso) return '';
                    const d = new Date(iso);
                    return d.toLocaleDateString('he-IL') + ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                },

                addFund() {
                    if (!this.newFundName.trim()) {
                        Swal.fire('שגיאה', 'נא להזין שם קופה', 'error');
                        return;
                    }
                    if (this.funds.some(f => f.name.toLowerCase() === this.newFundName.trim().toLowerCase())) {
                        Swal.fire('שגיאה', 'קופה בשם זה כבר קיימת', 'error');
                        return;
                    }
                    const fund = {
                        id: Date.now().toString(),
                        name: this.newFundName.trim(),
                        notes: this.newFundNotes.trim(),
                        balance: 0,
                        createdAt: this.getTodayDate(),
                        history: []
                    };
                    this.funds.push(fund);
                    this.saveFunds();
                    this.newFundName = '';
                    this.newFundNotes = '';
                    this.showAddFundForm = false;
                    Swal.fire('הצלחה', 'קופה נוספה בהצלחה', 'success');
                },

                deleteFund(fundId) {
                    const fund = this.funds.find(f => f.id === fundId);
                    if (!fund) return;

                    Swal.fire({
                        title: `מחיקת קופה: ${fund.name}`,
                        text: `מחיקה תסיר את הקופה וכל ההיסטוריה שלה. התחייבויות של מתפללים לקופה זו לא תימחקנה.`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'מחק',
                        cancelButtonText: 'ביטול'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.funds = this.funds.filter(f => f.id !== fundId);
                            this.saveFunds();
                            if (this.selectedFund?.id === fundId) {
                                this.selectedFund = null;
                            }
                            Swal.fire('הצלחה', 'קופה נמחקה', 'success');
                        }
                    });
                },

                selectFund(fundId) {
                    this.selectedFund = this.funds.find(f => f.id === fundId);
                },

                startEditFund(fundId) {
                    const fund = this.funds.find(f => f.id === fundId);
                    if (fund) {
                        this.fundEditingId = fundId;
                        this.fundEditingName = fund.name;
                        this.fundEditingNotes = fund.notes;
                    }
                },

                cancelEditFund() {
                    this.fundEditingId = null;
                    this.fundEditingName = '';
                    this.fundEditingNotes = '';
                },

                saveEditFund() {
                    if (!this.fundEditingName.trim()) {
                        Swal.fire('שגיאה', 'נא להזין שם קופה', 'error');
                        return;
                    }
                    const fund = this.funds.find(f => f.id === this.fundEditingId);
                    if (!fund) return;

                    if (this.fundEditingName.toLowerCase() !== fund.name.toLowerCase() &&
                        this.funds.some(f => f.name.toLowerCase() === this.fundEditingName.trim().toLowerCase())) {
                        Swal.fire('שגיאה', 'קופה בשם זה כבר קיימת', 'error');
                        return;
                    }

                    fund.name = this.fundEditingName.trim();
                    fund.notes = this.fundEditingNotes.trim();
                    this.saveFunds();
                    this.fundEditingId = null;
                    this.fundEditingName = '';
                    this.fundEditingNotes = '';
                    if (this.selectedFund?.id === fund.id) {
                        this.selectedFund = { ...fund };
                    }
                    Swal.fire('הצלחה', 'קופה עודכנה', 'success');
                },

                // בונה רשימת <option> למתפללים, למיון בסדר א-ב, עם אפשרות לסמן ID נבחר מראש
                getMemberOptionsHtml(selectedId = '') {
                    const sorted = [...this.members].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'he'));
                    let html = `<option value="">בחר מתפלל...</option>`;
                    sorted.forEach(m => {
                        const sel = String(m.memberUniqueId) === String(selectedId) ? 'selected' : '';
                        html += `<option value="${m.memberUniqueId}" ${sel}>${this.escapeHtml(m.name)}</option>`;
                    });
                    return html;
                },

                //add money to fund
                addFundAddition() {
                    Swal.fire({
                        title: 'הוספה לקופה',
                        html: `
                            <div style="text-align: right; margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">תאריך:</label>
                                <input type="date" id="additionDate" class="swal2-input fund-popup-input" value="${this.getTodayDate()}">
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">שם היוזם:</label>
                                <select id="additionMemberId" class="swal2-select fund-popup-input">
                                    ${this.getMemberOptionsHtml()}
                                </select>
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">סכום להוספה:</label>
                                <input type="number" id="additionAmount" class="swal2-input fund-popup-input" placeholder="0">
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'הוסף',
                        cancelButtonText: 'ביטול',
                        preConfirm: () => {
                            const date = document.getElementById('additionDate').value;
                            const memberId = document.getElementById('additionMemberId').value;
                            const amount = Number(document.getElementById('additionAmount').value);
                            if (!date) {
                                Swal.showValidationMessage('נא להזין תאריך');
                                return false;
                            }
                            if (!memberId) {
                                Swal.showValidationMessage('נא לבחור מתפלל');
                                return false;
                            }
                            const member = this.members.find(m => String(m.memberUniqueId) === String(memberId));
                            return { date, memberId, name: member ? member.name : '', amount };
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const { date, name, memberId, amount } = result.value;
                            const historyItem = {
                                id: Date.now().toString(),
                                date: date,
                                amount: amount,
                                memberName: name,
                                memberId: memberId,
                                type: 'addition',
                                initiatedBy: name,
                                transactionId: ''
                            };
                            this.selectedFund.history.push(historyItem);
                            this.selectedFund.balance += amount;

                            const fundIndex = this.funds.findIndex(f => f.id === this.selectedFund.id);
                            if (fundIndex !== -1) {
                                this.funds[fundIndex] = { ...this.selectedFund };
                            }
                            this.saveFunds();
                            Swal.fire('הצלחה', 'כסף נוסף לקופה', 'success');
                        }
                    });
                },

                //take money from fund — ניצול כסף לטובת מטרת תשלום (מהוה התחייבות של הקופה כלפי מטרת התשלום)
                addFundReduction() {
                    if (this.paymentPurposes.length === 0) {
                        Swal.fire('אין מטרות תשלום', 'יש להגדיר לפחות מטרת תשלום אחת בדף הראשי של ניהול הקופות לפני ביצוע ניצול כסף.', 'warning');
                        return;
                    }
                    Swal.fire({
                        title: 'ניצול כסף מהקופה',
                        html: `
                            <div style="text-align: right; margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">תאריך:</label>
                                <input type="date" id="reductionDate" class="swal2-input fund-popup-input" value="${this.getTodayDate()}">
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">סכום לניצול:</label>
                                <input type="number" id="reductionAmount" class="swal2-input fund-popup-input" placeholder="0">
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">מטרת תשלום:</label>
                                <select id="reductionPurpose" class="swal2-select fund-popup-input">
                                    ${this.getPurposeOptionsHtml()}
                                </select>
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">פרטים:</label>
                                <textarea id="reductionDetails" class="swal2-textarea fund-popup-input" placeholder="פרטים נוספים (לא חובה)"></textarea>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'בצע ניצול',
                        cancelButtonText: 'ביטול',
                        preConfirm: () => {
                            const date = document.getElementById('reductionDate').value;
                            const amount = Number(document.getElementById('reductionAmount').value);
                            const purposeId = document.getElementById('reductionPurpose').value;
                            const details = document.getElementById('reductionDetails').value.trim();
                            if (!date) {
                                Swal.showValidationMessage('נא להזין תאריך');
                                return false;
                            }
                            if (!amount) {
                                Swal.showValidationMessage('נא להזין סכום');
                                return false;
                            }
                            if (!purposeId) {
                                Swal.showValidationMessage('נא לבחור מטרת תשלום');
                                return false;
                            }
                            const purpose = this.paymentPurposes.find(p => p.id === purposeId);
                            return { date, amount, purposeId, purposeName: purpose ? purpose.name : '', details };
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const { date, amount, purposeId, purposeName, details } = result.value;
                            const historyItem = {
                                id: Date.now().toString(),
                                date: date,
                                amount: amount,
                                purposeId: purposeId,
                                purposeName: purposeName,
                                details: details || '',
                                type: 'reduction',
                                transactionId: ''
                            };
                            this.selectedFund.history.push(historyItem);
                            this.selectedFund.balance -= amount;

                            const fundIndex = this.funds.findIndex(f => f.id === this.selectedFund.id);
                            if (fundIndex !== -1) {
                                this.funds[fundIndex] = { ...this.selectedFund };
                            }
                            this.saveFunds();
                            Swal.fire('הצלחה', 'הקופה הופחתה', 'success');
                        }
                    });
                },

                editFundOperation(historyId) {
                    const historyItem = this.selectedFund.history.find(h => h.id === historyId);
                    if (!historyItem) return;

                    const typeLabel = historyItem.type === 'commitment' ? 'התחייבות' :
                        historyItem.type === 'addition' ? 'הוספה' :
                            historyItem.type === 'reduction' ? 'הפחתה' : 'פעולה';

                    // ═══ עריכת "ניצול כסף" — תאריך, סכום, מטרת תשלום, פרטים ═══
                    if (historyItem.type === 'reduction') {
                        Swal.fire({
                            title: `עריכת ${typeLabel}`,
                            html: `
                                <div style="text-align: right; margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">תאריך:</label>
                                    <input type="date" id="editDate" class="swal2-input fund-popup-input" value="${historyItem.date}">
                                    <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">סכום:</label>
                                    <input type="number" id="editAmount" class="swal2-input fund-popup-input" value="${historyItem.amount}">
                                    <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">מטרת תשלום:</label>
                                    <select id="editPurpose" class="swal2-select fund-popup-input">
                                        ${this.getPurposeOptionsHtml(historyItem.purposeId)}
                                    </select>
                                    <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">פרטים:</label>
                                    <textarea id="editDetails" class="swal2-textarea fund-popup-input">${this.escapeHtml(historyItem.details || '')}</textarea>
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'עדכן',
                            cancelButtonText: 'ביטול',
                            preConfirm: () => {
                                const date = document.getElementById('editDate').value;
                                const amount = Number(document.getElementById('editAmount').value);
                                const purposeId = document.getElementById('editPurpose').value;
                                const details = document.getElementById('editDetails').value.trim();
                                if (!date) {
                                    Swal.showValidationMessage('נא להזין תאריך');
                                    return false;
                                }
                                if (!purposeId) {
                                    Swal.showValidationMessage('נא לבחור מטרת תשלום');
                                    return false;
                                }
                                const purpose = this.paymentPurposes.find(p => p.id === purposeId);
                                return { date, amount, purposeId, purposeName: purpose ? purpose.name : '', details };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                const { date, amount, purposeId, purposeName, details } = result.value;
                                const oldAmount = historyItem.amount;
                                const balanceDiff = amount - oldAmount;

                                historyItem.date = date;
                                historyItem.amount = amount;
                                historyItem.purposeId = purposeId;
                                historyItem.purposeName = purposeName;
                                historyItem.details = details || '';

                                this.selectedFund.balance -= balanceDiff;

                                const fundIndex = this.funds.findIndex(f => f.id === this.selectedFund.id);
                                if (fundIndex !== -1) {
                                    this.funds[fundIndex] = { ...this.selectedFund };
                                }
                                this.saveFunds();
                                Swal.fire('הצלחה', `${typeLabel} עודכנה`, 'success');
                            }
                        });
                        return;
                    }

                    // ═══ עריכת "התחייבות" / "הוספה" — נשארת מבוססת מתפלל, כפי שהייתה ═══
                    const showMemberSelect = historyItem.type === 'addition';
                    const nameFieldHtml = showMemberSelect ? `
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">שם היוזם:</label>
                                <select id="editMemberId" class="swal2-select fund-popup-input">
                                    ${this.getMemberOptionsHtml(historyItem.memberId)}
                                </select>` : `
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">שם:</label>
                                <input type="text" id="editName" class="swal2-input fund-popup-input" value="${this.escapeHtml(historyItem.memberName || '')}">`;

                    Swal.fire({
                        title: `עריכת ${typeLabel}`,
                        html: `
                            <div style="text-align: right; margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem;">תאריך:</label>
                                <input type="date" id="editDate" class="swal2-input fund-popup-input" value="${historyItem.date}">
                                ${nameFieldHtml}
                                <label style="display: block; margin-bottom: 0.5rem; margin-top: 1rem;">סכום:</label>
                                <input type="number" id="editAmount" class="swal2-input fund-popup-input" value="${historyItem.amount}">
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'עדכן',
                        cancelButtonText: 'ביטול',
                        preConfirm: () => {
                            const date = document.getElementById('editDate').value;
                            const amount = Number(document.getElementById('editAmount').value);
                            if (!date) {
                                Swal.showValidationMessage('נא להזין תאריך');
                                return false;
                            }
                            let name, memberId;
                            if (showMemberSelect) {
                                memberId = document.getElementById('editMemberId').value;
                                if (!memberId) {
                                    Swal.showValidationMessage('נא לבחור מתפלל');
                                    return false;
                                }
                                const member = this.members.find(m => String(m.memberUniqueId) === String(memberId));
                                name = member ? member.name : '';
                            } else {
                                name = document.getElementById('editName').value.trim();
                                memberId = historyItem.memberId;
                                if (!name) {
                                    Swal.showValidationMessage('נא להזין שם');
                                    return false;
                                }
                            }
                            return { date, name, memberId, amount };
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const { date, name, memberId, amount } = result.value;
                            const oldAmount = historyItem.amount;
                            const balanceDiff = amount - oldAmount;

                            historyItem.date = date;
                            historyItem.memberName = name;
                            if (showMemberSelect) {
                                historyItem.memberId = memberId;
                            }
                            historyItem.amount = amount;
                            historyItem.initiatedBy = name;

                            // עדכן את היתרה בהתאם לסוג הפעולה
                            this.selectedFund.balance += balanceDiff;

                            // עדכן גם בתרנזקציה של המתפלל אם קיימת (רק לcommitment)
                            if (historyItem.type === 'commitment' && historyItem.transactionId) {
                                const transaction = this.transactions.find(t => t.transactionId === historyItem.transactionId);
                                if (transaction) {
                                    transaction.commitmentAmount = amount;
                                    transaction.commitmentDate = date;
                                    this.saveTransactionsData();
                                }
                            }

                            const fundIndex = this.funds.findIndex(f => f.id === this.selectedFund.id);
                            if (fundIndex !== -1) {
                                this.funds[fundIndex] = { ...this.selectedFund };
                            }
                            this.saveFunds();
                            Swal.fire('הצלחה', `${typeLabel} עודכנה`, 'success');
                        }
                    });
                },

                deleteFundOperation(historyId) {
                    const historyItem = this.selectedFund.history.find(h => h.id === historyId);
                    if (!historyItem) return;

                    const typeLabel = historyItem.type === 'commitment' ? 'התחייבות' :
                        historyItem.type === 'addition' ? 'הוספה' :
                            historyItem.type === 'reduction' ? 'הפחתה' : 'פעולה';

                    Swal.fire({
                        title: `מחיקת ${typeLabel}`,
                        text: 'האם למחוק פעולה זו?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'מחק',
                        cancelButtonText: 'ביטול'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const amount = historyItem.amount;

                            // עדכן את היתרה בהתאם לסוג הפעולה
                            if (historyItem.type === 'commitment' || historyItem.type === 'addition') {
                                this.selectedFund.balance -= amount;
                            } else if (historyItem.type === 'reduction') {
                                this.selectedFund.balance += amount;
                            }

                            this.selectedFund.history = this.selectedFund.history.filter(h => h.id !== historyId);

                            // מחק גם מתרנזקציה של המתפלל אם קיימת (רק לcommitment)
                            if (historyItem.type === 'commitment' && historyItem.transactionId) {
                                const transaction = this.transactions.find(t => t.transactionId === historyItem.transactionId);
                                if (transaction && transaction.fund === this.selectedFund.name) {
                                    delete transaction.fund;
                                    delete transaction.fundId;
                                    this.saveTransactionsData();
                                }
                            }

                            const fundIndex = this.funds.findIndex(f => f.id === this.selectedFund.id);
                            if (fundIndex !== -1) {
                                this.funds[fundIndex] = { ...this.selectedFund };
                            }
                            this.saveFunds();
                            Swal.fire('הצלחה', `${typeLabel} נמחקה`, 'success');
                        }
                    });
                },

                getRegularPurposeOptions(type) {
                    const cols = type === 'payments' ? this.config.paymentColumns : this.config.commitmentColumns;
                    const col = cols.find(c => c.field === 'purpose');
                    if (!col || !col.options) return [];
                    return col.options.split(',').map(x => x.trim()).filter(Boolean);
                },

                getActiveFunds() {
                    return this.funds.filter(f => f.name && f.name.trim() !== '')
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || (a.name || '').localeCompare(b.name || '', 'he'));
                },

                getFundById(fundId) {
                    return this.funds.find(f => f.id === fundId) || null;
                },

                // כסף נכנס: התחייבויות מתפללים + הוספות ידניות לקופה
                getFundIncomingHistory() {
                    if (!this.selectedFund || !this.selectedFund.history) return [];
                    return [...this.selectedFund.history]
                        .filter(h => h.type === 'commitment' || h.type === 'addition')
                        .reverse();
                },

                // ניצול כסף מהקופה: הפחתות בלבד
                getFundUsageHistory() {
                    if (!this.selectedFund || !this.selectedFund.history) return [];
                    return [...this.selectedFund.history]
                        .filter(h => h.type === 'reduction')
                        .reverse();
                },

                getFundByName(name) {
                    const nm = String(name || '').trim();
                    return this.funds.find(f => String(f.name || '').trim() === nm) || null;
                },

                getPurposeOptions(type) {
                    const regular = this.getRegularPurposeOptions(type).map(v => ({ label: v, value: v, type: 'regular' }));
                    if (type === 'payments') {//funds are only relevant for commitments
                        return regular;
                    }
                    const funds = this.getActiveFunds().map(f => ({
                        label: f.name,
                        value: `fund:${f.id}`,
                        fundId: f.id,
                        type: 'fund'
                    }));
                    if (!funds.length) return regular;
                    return [...regular, { label: '──────────', value: '__divider__', disabled: true, type: 'divider' }, ...funds];
                },

                parsePurposeSelection(value) {
                    const raw = String(value || '').trim();
                    if (!raw || raw === '__divider__') return { isFund: false, label: '', fundId: null };
                    if (raw.startsWith('fund:')) {
                        const fundId = raw.slice(5);
                        const fund = this.getFundById(fundId);
                        return { isFund: true, label: fund ? fund.name : '', fundId };
                    }
                    const fundByName = this.getFundByName(raw);
                    if (fundByName) return { isFund: true, label: fundByName.name, fundId: fundByName.id };
                    return { isFund: false, label: raw, fundId: null };
                },

                getCommitmentFunds() {
                    return this.funds.filter(f => f.name && f.name.trim() !== '');
                },

                addCommitmentToFund(fundName, amount, date, memberId, memberName, transactionId) {
                    const fund = this.funds.find(f => f.name === fundName);
                    if (!fund) return;

                    const historyItem = {
                        id: Date.now().toString(),
                        date: date,
                        amount: amount,
                        memberName: memberName,
                        memberId: memberId,
                        type: 'commitment',
                        initiatedBy: '',
                        transactionId: transactionId
                    };
                    fund.history.push(historyItem);

                    // fix: Immediate update of the money amount
                    if (this.selectedFund && this.selectedFund.id === fund.id) {
                        this.selectedFund = { ...fund };
                    }

                    fund.balance += amount;
                    this.saveFunds();
                },

                removeCommitmentFromFund(transactionId) {
                    this.funds.forEach(fund => {
                        const historyItem = fund.history.find(h => h.transactionId === transactionId);
                        if (historyItem) {
                            fund.balance -= historyItem.amount;
                            fund.history = fund.history.filter(h => h.id !== historyItem.id);

                            // fix: Immediate update of the money amount
                            if (this.selectedFund && this.selectedFund.id === fund.id) {
                                this.selectedFund = { ...fund };
                            }
                        }
                    });
                    this.saveFunds();
                },

                updateCommitmentInFund(transactionId, newAmount, newDate, fundId = null) {
                    let fund = null;
                    if (fundId) {
                        fund = this.funds.find(f => f.id === fundId);
                    } else {
                        // Fallback: find by transaction
                        this.funds.forEach(f => {
                            if (!fund) fund = f.history.find(h => h.transactionId === transactionId) ? f : null;
                        });
                    }
                    if (!fund) return;

                    const historyItem = fund.history.find(h => h.transactionId === transactionId);
                    if (!historyItem) return;

                    const oldAmount = historyItem.amount;
                    historyItem.amount = newAmount;
                    historyItem.date = newDate;
                    fund.balance = fund.balance - oldAmount + newAmount;

                    if (this.selectedFund && this.selectedFund.id === fund.id) {
                        this.selectedFund = { ...fund };
                    }
                    this.saveFunds();
                },
            }
        }