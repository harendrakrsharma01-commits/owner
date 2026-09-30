<?php
/**
 * Anganwadi salary (maandey) calculator — single source of truth.
 *
 * Every rupee figure below must carry a source and a check date. When a state revises its
 * honorarium: move the old figures into 'previous', put the new ones in 'rates', update
 * 'effective', 'note', 'sources' and site.updated, then rebuild with php tools/build-static.php.
 * A figure we could not confirm stays null — the page then asks the visitor to type their own
 * amount instead of showing a guess.
 */

return [

    'site' => [
        'name'      => 'EasyCalculatorSmart',
        'base_url'  => 'https://easycalculatorsmart.com',
        'asset_ver' => '2026.09.30',
        'updated'   => '2026-09-30',
    ],

    /* ------------------------------------------------------------------
     * Settings shipped to the browser (JSON). Keep it free of secrets.
     * ------------------------------------------------------------------ */
    'client' => [
        'defaultState' => 'up',
        'defaultPost'  => 'worker',
        'firstMonth'   => '2018-10',   // earliest month offered in the arrear pickers (last central revision)

        // Central ICDS norms (unchanged since 1 October 2018) and the cost-sharing ratio.
        'centre' => [
            'norms' => ['worker' => 4500, 'mini' => 3500, 'helper' => 2250],
            'pli'   => ['worker' => 500,  'mini' => 500,  'helper' => 250],   // performance-linked incentive
        ],
        'sharing' => [
            60  => '60:40 — सामान्य राज्य',
            90  => '90:10 — पूर्वोत्तर व हिमालयी राज्य, J&K',
            100 => '100:0 — बिना विधानसभा वाले केंद्रशासित प्रदेश',
        ],

        'posts' => [
            'worker' => 'आंगनवाड़ी कार्यकर्ता (सेविका)',
            'mini'   => 'मिनी आंगनवाड़ी कार्यकर्ता',
            'helper' => 'आंगनवाड़ी सहायिका (हेल्पर)',
        ],

        // status: 'confirmed' = amounts shown; 'unverified' = visitor types the amount.
        // rates/previous: monthly ₹ per post; null = not confirmed. workerSenior = longer-service rate.
        'states' => [
            'up' => [
                'name' => 'उत्तर प्रदेश', 'en' => 'Uttar Pradesh', 'sharing' => 60, 'status' => 'confirmed',
                'rates'    => ['worker' => 12000, 'mini' => null, 'helper' => 6000],
                'previous' => ['worker' => 8000,  'mini' => null, 'helper' => 4000],
                'effective' => '2026-09',
                'note' => 'बढ़ा हुआ मानदेय सितंबर 2026 से लागू, भुगतान अक्टूबर 2026 में। मिनी आंगनवाड़ी की नई राशि की पुष्टि नहीं हुई।',
                'sources' => ['up-air', 'up-prabhat'],
            ],
            'bihar' => [
                'name' => 'बिहार', 'en' => 'Bihar', 'sharing' => 60, 'status' => 'confirmed',
                'rates'    => ['worker' => 9000, 'mini' => null, 'helper' => 4500],
                'previous' => ['worker' => 7000, 'mini' => null, 'helper' => 4000],
                'effective' => '2025-10',
                'note' => 'सितंबर 2025 में कैबिनेट की मंज़ूरी, 1 अक्टूबर 2025 से लागू। मिनी आंगनवाड़ी की राशि की पुष्टि नहीं हुई।',
                'sources' => ['bihar-air', 'bihar-scroll'],
            ],
            'mp' => [
                'name' => 'मध्य प्रदेश', 'en' => 'Madhya Pradesh', 'sharing' => 60, 'status' => 'confirmed',
                'rates'    => ['worker' => 13000, 'mini' => 6500, 'helper' => 6500],
                'previous' => ['worker' => 10000, 'mini' => 3500, 'helper' => 5000],
                'effective' => '2023-07',
                'note' => 'जून 2023 में घोषणा, 1 जुलाई 2023 से लागू। इसके बाद की किसी बढ़ोतरी की पुष्टि हमें नहीं मिली।',
                'sources' => ['mp-patrika', 'mp-etv'],
            ],
            'haryana' => [
                'name' => 'हरियाणा', 'en' => 'Haryana', 'sharing' => 60, 'status' => 'confirmed',
                'rates'    => ['worker' => 13250, 'workerSenior' => 14750, 'mini' => null, 'helper' => 7900],
                'previous' => ['worker' => 12500, 'workerSenior' => 14000, 'mini' => null, 'helper' => 7500],
                'seniorLabel' => '10 साल से ज़्यादा सेवा है',
                'effective' => '2024-08',
                'note' => '16 अगस्त 2024 से लागू। कार्यकर्ता का मानदेय सेवा के साल पर निर्भर है (10 साल से ज़्यादा: ₹14,750)। मिनी आंगनवाड़ी की नई राशि की पुष्टि नहीं हुई।',
                'sources' => ['hr-story', 'hr-bs'],
            ],
            'jharkhand' => [
                'name' => 'झारखंड', 'en' => 'Jharkhand', 'sharing' => 60, 'status' => 'confirmed',
                'rates'    => ['worker' => 9500, 'mini' => 9500, 'helper' => 4750],
                'previous' => ['worker' => null, 'mini' => null, 'helper' => null],
                'effective' => null,
                'note' => 'अगस्त 2022 में कैबिनेट से मंज़ूर राशि; 2025 की रिपोर्टों में भी यही राशि। मिनी केंद्र की सेविका को भी यही मानदेय।',
                'sources' => ['jh-etv', 'jh-prabhat'],
            ],
            'gujarat' => [
                'name' => 'गुजरात', 'en' => 'Gujarat', 'sharing' => 60, 'status' => 'confirmed',
                'rates'    => ['worker' => 10000, 'mini' => null, 'helper' => 5500],
                'previous' => ['worker' => null, 'mini' => null, 'helper' => null],
                'effective' => null,
                'note' => 'सितंबर 2026 की आंगनवाड़ी भर्ती अधिसूचना में बताया गया मानदेय। मिनी आंगनवाड़ी की राशि की पुष्टि नहीं हुई।',
                'sources' => ['gj-notice', 'gj-maru'],
            ],
            'rajasthan' => [
                'name' => 'राजस्थान', 'en' => 'Rajasthan', 'sharing' => 60, 'status' => 'unverified',
                'rates'    => ['worker' => null, 'mini' => null, 'helper' => null],
                'previous' => ['worker' => null, 'mini' => null, 'helper' => null],
                'effective' => '2026-04',
                'note' => 'बजट 2026-27 के तहत 1 अप्रैल 2026 से राज्य के हिस्से में 10% बढ़ोतरी की खबर है, पर नई राशि किसी भरोसेमंद स्रोत में नहीं मिली। अपना मासिक मानदेय खुद डालें।',
                'sources' => ['rj-firstindia', 'rj-bs'],
            ],
            'maharashtra' => [
                'name' => 'महाराष्ट्र', 'en' => 'Maharashtra', 'sharing' => 60, 'status' => 'unverified',
                'rates'    => ['worker' => null, 'mini' => null, 'helper' => null],
                'previous' => ['worker' => null, 'mini' => null, 'helper' => null],
                'effective' => null,
                'note' => 'अलग-अलग रिपोर्टों में सेविका का मानदेय ₹10,000 से ₹15,000 तक बताया गया है, इसलिए हमने कोई राशि नहीं भरी। अपना मासिक मानदेय खुद डालें।',
                'sources' => ['mh-alert'],
            ],
        ],

        'labels' => [
            'errAmount'   => 'मासिक मानदेय ₹1 से ₹1,00,000 के बीच सही राशि में डालें (जैसे 12000)।',
            'needAmount'  => 'इस राज्य/पद की राशि की पुष्टि नहीं हुई है — अपने आदेश या बैंक पासबुक से मासिक मानदेय डालें।',
            'errOld'      => 'पुराना मानदेय सही राशि में डालें।',
            'errLower'    => 'नया मानदेय पुराने से कम है, इसलिए एरियर नहीं बनता।',
            'copied'      => 'नतीजा कॉपी हो गया।',
            'custom'      => 'आपकी डाली हुई राशि',
        ],
    ],

    /* ------------------------------------------------------------------
     * Sources (cited next to results and in the page "Sources" section).
     * Figures were taken from the reports below on the check date in site.updated.
     * ------------------------------------------------------------------ */
    'sources' => [
        'centre-pq'    => ['राज्यसभा प्रश्न, 11 दिसंबर 2024 — आंगनवाड़ी मानदेय, 60:40 / 90:10 अनुपात और प्रोत्साहन राशि (महिला एवं बाल विकास मंत्रालय)', 'https://rsdebate.nic.in/bitstream/123456789/753787/1/PQ_266_11122024_U1907_p421_p427.pdf'],
        'centre-pib'   => ['PIB, फ़रवरी 2024 — आंगनवाड़ी कार्यकर्ताओं व सहायिकाओं के लिए भारत सरकार की पहल', 'https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/feb/doc202427307901.pdf'],
        'up-air'       => ['आकाशवाणी समाचार, 9 सितंबर 2026 — उत्तर प्रदेश सरकार ने आंगनवाड़ी कार्यकर्ताओं व सहायिकाओं का मानदेय बढ़ाया', 'https://newsonair.gov.in/uttar-pradesh-government-increases-honorarium-of-anganwadi-workers-and-helpers/'],
        'up-prabhat'   => ['प्रभात खबर — यूपी में अब 8 नहीं, 12 हजार मिलेगा आंगनबाड़ी कार्यकर्ताओं को मानदेय', 'https://www.prabhatkhabar.com/state/uttar-pradesh/lucknow/up-anganwadi-workers-honorarium-12000-assistants-6000-yogi'],
        'bihar-air'    => ['आकाशवाणी समाचार, 9 सितंबर 2025 — बिहार कैबिनेट ने सेविका-सहायिका मानदेय बढ़ोतरी को मंज़ूरी दी', 'https://www.newsonair.gov.in/bihar-cabinet-approves-hike-in-honorarium-for-anganwadi-sevikas-and-sahayikas'],
        'bihar-scroll' => ['Scroll.in — Bihar Cabinet approves increase in stipend for anganwadi workers', 'https://scroll.in/latest/1086396/bihar-cabinet-approves-stipend-hike-for-anganwadi-workers-and-helpers'],
        'mp-patrika'   => ['पत्रिका — मध्यप्रदेश में आंगनबाड़ी कार्यकर्ताओं-सहायिकाओं की सैलरी बढ़ी (2023)', 'https://www.patrika.com/bhopal-news/anganwadi-karyakarta-and-sahayika-salary-increased-in-madhya-pradesh-8342177'],
        'mp-etv'       => ['ETV भारत, जून 2023 — MP आंगनबाड़ी कार्यकर्ताओं का बढ़ा वेतन', 'https://www.etvbharat.com/hindi/madhya-pradesh/state/bhopal/cm-shivraj-increased-salary-of-anganwadi-workers-in-mp-workers-get-1-dot-25-lakh-on-retirement/mp20230611183416515515373'],
        'hr-story'     => ['The Haryana Story, अगस्त 2024 — Haryana Government Boosts Wages for Anganwadi Workers and Helpers', 'https://en.theharyanastory.com/article/249/haryana-government-boosts-wages-for-anganwadi-workers-and-helpers'],
        'hr-bs'        => ['Business Standard, नवंबर 2023 — CM Khattar raises remuneration, retirement benefits of anganwadi workers', 'https://www.business-standard.com/economy/news/cm-khattar-raises-honorarium-retirement-benefits-of-anganwadi-workers-123111800888_1.html'],
        'jh-etv'       => ['ETV भारत, अगस्त 2022 — झारखंड सरकार ने आंगनबाड़ी सेविका-सहायिका का मानदेय बढ़ाया', 'https://www.etvbharat.com/hindi/jharkhand/city/ranchi/jharkhand-government-increased-honorarium-of-anganwadi-sevika-and-sahayika/jh20220824185842128128190'],
        'jh-prabhat'   => ['प्रभात खबर — झारखंड की आंगनबाड़ी सेविका-सहायिकाओं का मानदेय बढ़ा', 'https://www.prabhatkhabar.com/state/jharkhand/ranchi/increase-honorarium-of-about-38-thousand-anganwadi-workers-and-assistants-of-jharkhand-cm-hemant-soren-gave-approval-smj'],
        'gj-notice'    => ['FreeJobAlert — Gujarat Anganwadi Recruitment 2026 (6,843 पद) अधिसूचना सारांश', 'https://www.freejobalert.com/articles/gujarat-anganwadi-recruitment-2026-apply-online-for-6843-anganwadi-worker-and-helper-posts-3068594'],
        'gj-maru'      => ['MaruGujarat — Anganwadi Worker & Helper Recruitment 2026-27 (ICDS Gujarat)', 'https://www.marugujarat.in/2026/09/anganwadi-worker-helper-recruitment-2026-27-gujarat-icds/'],
        'rj-firstindia' => ['First India — 1 अप्रैल से आंगनबाड़ी कार्यकर्ताओं के मानदेय में 10% बढ़ोतरी', 'https://firstindianews.com/news/anganwadi-workers-honorarium-hike-10-percent-from-april-1-india-benefits-2026'],
        'rj-bs'        => ['बिज़नेस स्टैंडर्ड हिंदी — राजस्थान में आंगनबाड़ी कार्यकर्ताओं का मानदेय बढ़ा', 'https://hindi.business-standard.com/storypage_hin.php?autono=1485527'],
        'mh-alert'     => ['Marathi Alert — अंगणवाडी सेविका व मदतनीस मानधन आणि प्रोत्साहन भत्ता (मे 2026 शासन निर्णय)', 'https://marathialert.com/anganwadi-sevika-madatnis-april-salary/'],
    ],

    /* ------------------------------------------------------------------
     * Existing site pages we link to instead of duplicating.
     * ------------------------------------------------------------------ */
    'related' => [
        ['title' => 'Date of Birth Calculator', 'url' => '/date-of-birth-calculator/', 'desc' => 'भर्ती की आयु सीमा (18–35 साल) के लिए सही उम्र निकालें।'],
    ],

    /* ------------------------------------------------------------------
     * Page.
     * ------------------------------------------------------------------ */
    'page' => [
        'slug'    => 'anganwadi-salary-calculator',
        'title'   => 'Anganwadi Salary Calculator 2026 – आंगनवाड़ी मानदेय कैलकुलेटर (राज्यवार)',
        'h1'      => 'आंगनवाड़ी सैलरी (मानदेय) कैलकुलेटर 2026',
        'kicker'  => 'Anganwadi Salary Calculator · राज्यवार',
        'meta'    => 'आंगनवाड़ी कार्यकर्ता, मिनी कार्यकर्ता और सहायिका का मासिक व सालाना मानदेय राज्य के हिसाब से निकालें — UP, बिहार, MP, हरियाणा, झारखंड, गुजरात। बढ़ोतरी और एरियर भी।',
        'intro'   => 'राज्य और पद चुनें — मासिक मानदेय, सालाना कमाई, केंद्र और राज्य का हिस्सा, और बढ़े हुए मानदेय का एरियर तुरंत देखें। हर राशि के साथ उसका स्रोत और तारीख दी गई है।',
        'sources' => ['centre-pq', 'centre-pib', 'up-air', 'up-prabhat', 'bihar-air', 'bihar-scroll', 'mp-patrika', 'mp-etv', 'hr-story', 'hr-bs', 'jh-etv', 'jh-prabhat', 'gj-notice', 'gj-maru', 'rj-firstindia', 'rj-bs', 'mh-alert'],
        'faq' => [
            ['2026 में आंगनवाड़ी कार्यकर्ता की सैलरी कितनी है?', 'यह राज्य पर निर्भर है। इस पेज की जाँच (30 सितंबर 2026) के समय: उत्तर प्रदेश ₹12,000 (सितंबर 2026 से), मध्य प्रदेश ₹13,000, हरियाणा ₹13,250 से ₹14,750 (सेवा के हिसाब से), गुजरात ₹10,000, झारखंड ₹9,500 और बिहार ₹9,000 प्रति माह। इन सब में केंद्र का तय मानदेय (नॉर्म) ₹4,500 शामिल है — उससे ऊपर की राशि राज्य अपने बजट से जोड़ते हैं।'],
            ['आंगनवाड़ी सहायिका (हेल्पर) को कितना मानदेय मिलता है?', 'उत्तर प्रदेश ₹6,000, मध्य प्रदेश ₹6,500, हरियाणा ₹7,900, गुजरात ₹5,500, झारखंड ₹4,750 और बिहार ₹4,500 प्रति माह। केंद्र का तय मानदेय सहायिका के लिए ₹2,250 है।'],
            ['केंद्र सरकार आंगनवाड़ी मानदेय में कितना देती है?', '1 अक्टूबर 2018 से केंद्र का तय मानदेय कार्यकर्ता ₹4,500, मिनी कार्यकर्ता ₹3,500 और सहायिका ₹2,250 है। इसका खर्च सामान्य राज्यों में 60:40 (केंद्र:राज्य), पूर्वोत्तर व हिमालयी राज्यों में 90:10 और बिना विधानसभा वाले केंद्रशासित प्रदेशों में 100% केंद्र उठाता है। इसके ऊपर जो भी राशि मिलती है, वह राज्य अपने बजट से देता है।'],
            ['UP में ₹12,000 वाला मानदेय कब से मिलेगा?', 'शासनादेश के अनुसार बढ़ा हुआ मानदेय सितंबर 2026 से प्रभावी है और इसका भुगतान अक्टूबर 2026 में होगा। कार्यकर्ता का मानदेय ₹8,000 से ₹12,000 और सहायिका का ₹4,000 से ₹6,000 हुआ है।'],
            ['एरियर (बकाया) कैसे निकालें?', 'नई और पुरानी राशि का अंतर निकालें और उसे उन महीनों से गुणा करें जिनमें नई दर लागू थी पर पुरानी दर से भुगतान हुआ। जैसे बिहार में सेविका का मानदेय ₹7,000 से ₹9,000 हुआ (अक्टूबर 2025 से); अगर अक्टूबर से दिसंबर तक पुरानी दर मिली, तो एरियर = ₹2,000 × 3 = ₹6,000। कैलकुलेटर में "एरियर निकालें" खोलकर महीने चुनें।'],
            ['प्रोत्साहन राशि (PLI) क्या है?', 'केंद्र सरकार प्रदर्शन के आधार पर कार्यकर्ता को ₹500 और सहायिका को ₹250 प्रति माह प्रोत्साहन राशि देती है। यह हर महीने तय नहीं होती और कई राज्य इसे मानदेय से अलग दिखाते हैं, इसलिए कैलकुलेटर में इसे अलग से जोड़ने का विकल्प है।'],
            ['मेरे राज्य की राशि कैलकुलेटर में क्यों नहीं दिख रही?', 'हम सिर्फ वही राशि दिखाते हैं जो भरोसेमंद समाचार या सरकारी स्रोत में साफ़ मिली हो। राजस्थान और महाराष्ट्र की नई राशि पर रिपोर्टें अलग-अलग हैं, इसलिए वहाँ और "अन्य राज्य" में अपना मानदेय खुद डालें — बाकी हिसाब कैलकुलेटर कर देगा।'],
            ['क्या यह कैलकुलेटर सरकारी है?', 'नहीं। यह एक स्वतंत्र हिसाब लगाने वाला टूल है। आपका असली भुगतान आपके राज्य के महिला एवं बाल विकास विभाग के आदेश से तय होता है — किसी भी अंतर पर अपने CDPO या सुपरवाइज़र से पुष्टि करें।'],
        ],
    ],
];
