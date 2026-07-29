import type { Lang } from "./i18n";

/**
 * Legal / commercial page copy, EN + EL.
 *
 * Kept out of lib/i18n.ts because it's long-form prose rather than UI strings,
 * and it changes on a different cadence (lawyer review) than the interface.
 *
 * ⚠️ The Greek text carries statutory consumer-law disclosures. Figures, dates
 * and statute references are reproduced from the existing English pages and
 * MUST NOT be "tidied up" without a Greek lawyer. Known open issues are tracked
 * in the project ledger, not silently patched here.
 */

export interface LegalSection {
  heading: string;
  body: string[];
  bullets?: string[];
}
export interface LegalPage {
  title: string;
  intro: string;
  sections: LegalSection[];
}
export interface LegalDeck {
  terms: LegalPage;
  shipping: LegalPage;
  returns: LegalPage;
  payment: LegalPage;
}

const en: LegalDeck = {
  terms: {
    title: "Terms of Use & Privacy",
    intro:
      "Visiting this site or using material from it means you accept the terms below. If you do not agree with them, please do not use the site.",
    sections: [
      {
        heading: "1. Intellectual property",
        body: [
          "The content of this site is the intellectual property of bertolucci.com.gr, with all rights reserved except where expressly granted. Every intellectual property right in the site belongs to Berto Lucci or to lawfully associated third parties. Accessing the site means accepting the applicable intellectual property law.",
        ],
      },
      {
        heading: "2. Personal data",
        body: [
          "We strictly apply the data-protection principles of European and Greek law (GDPR, Directive 2000/31/EC, Law 2251/1994 and Law 2472/1997). We do not misuse your personal data, and we do not disclose, publish, sell, rent or exchange your information with third parties. On your request, your personal data is permanently deleted. For any question about how your data is collected or processed, write to info@bertolucci.com.gr.",
        ],
      },
      {
        heading: "3. Third-party websites",
        body: [
          "The site may link to websites owned or operated by third parties. Those third parties are responsible for their own content.",
        ],
      },
      {
        heading: "4. Limitation of liability",
        body: [
          "We depict our products as accurately as we can through photographs, descriptions and comments. The site may still contain typographic, numeric or photographic errors. Berto Lucci does not warrant the accuracy or completeness of the depictions and descriptions, or the reliability of any advice, opinion or statement published on the site.",
        ],
      },
      {
        heading: "5. Prices & VAT",
        body: [
          "All prices shown include 24% VAT and apply to the quantities held in our warehouse. Berto Lucci reserves the right to adjust prices. On credit-card instalment purchases, the monthly instalment equals the product price divided by the number of instalments you choose, with no added interest.",
        ],
      },
      {
        heading: "6. Governing law",
        body: [
          "All transactions through bertolucci.com.gr are governed by international and European law on electronic commerce (Directive 2000/31/EC, PD 131/2003) and by Greek consumer-protection law (Law 2251/1994) on distance selling.",
        ],
      },
      {
        heading: "7. Questions & complaints",
        body: [
          "For any complaint or question about a product you intend to buy or have already bought, call customer service on +30 210 524 6634, Monday to Friday 09:00 to 17:00, or write to info@bertolucci.com.gr.",
        ],
      },
      {
        heading: "8. Company details",
        body: [
          "BLUE BELL S.A. (AEBE) operates the Berto Lucci online store. Registered office: 37 Ermou Street, Athens 105 63. VAT number 999640058. GEMI number 004853001000. Telephone +30 210 524 6634. Email info@bertolucci.com.gr.",
        ],
      },
    ],
  },
  shipping: {
    title: "Shipping & Delivery",
    intro:
      "Every order, placed online or by phone, ships with our courier partner ACS, with pickup options across Greece.",
    sections: [
      {
        heading: "Shipping costs",
        body: ["Shipping is charged on your order total, not on parcel weight or destination."],
        bullets: [
          "€3.50 flat rate on orders up to €40.",
          "Free shipping on all orders over €40. We cover the cost.",
        ],
      },
      {
        heading: "Delivery times",
        body: [
          "The times below are indicative, count business days, and start from the moment your order is dispatched.",
          "Dispatch may be delayed by 3 to 5 business days if an item in your order is temporarily unavailable. Incomplete or unverified customer details can also hold an order up.",
        ],
        bullets: [
          "1 to 3 days for Attica and accessible areas of the mainland.",
          "2 to 5 days for islands and remote destinations.",
        ],
      },
      {
        heading: "Delivery options",
        body: [
          "Home delivery brings your order to your door via ACS courier.",
          "BoxNow lockers let you collect your parcel 24/7 from automated lockers across Greece.",
          "Collect in store is available when you choose store pickup at checkout. Orders are prepaid online by debit or credit card before collection.",
        ],
      },
      {
        heading: "Delays & lost parcels",
        body: [
          "Berto Lucci is not liable for consequences arising from courier delays or the loss of a parcel. If a parcel has not arrived within 7 business days, we open an investigation with the carrier, which can take up to 10 days. If the parcel is not located, the order is cancelled and any card payment is refunded within 7 days of that deadline.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns & Exchanges",
    intro:
      "How to return an item, how to exchange one, and how your statutory right of withdrawal works.",
    sections: [
      {
        heading: "On receiving your order",
        body: [
          "Check that the products match your order. If anything is incorrect, contact us the same day, or at the latest the next business day, on +30 210 524 6634 or at info@bertolucci.com.gr.",
          "If the product delivered does not correspond to what was ordered, whether through an error in order-taking, pricing or shipping, or a defect, you may return it the same or next business day. The item must be unused and in excellent condition with its packaging intact. In these cases we cover the shipping for both the return and the replacement.",
        ],
      },
      {
        heading: "Exchanges",
        body: [
          "To exchange an item for another, for reasons of size or design, notify us within 14 days of receipt by phone or email. We review each request subject to availability within the same season.",
        ],
        bullets: [
          "Exchange shipping is paid by the customer. With our partner ACS the total cost for both parcels is €5.99, and the new delivery and the collection of the old parcel happen at the same time.",
          "Exchanges are free in our own stores, outside the franchise network, on presentation of proof of purchase.",
          "During sale periods, exchanges are processed at the products' current price.",
          "Items bought on discount or offer can be exchanged only for items likewise on discount or offer.",
          "Outlet items can be exchanged only for other Outlet items.",
        ],
      },
      {
        heading: "Right of withdrawal",
        body: [
          "Under Greek Law 2251/1994, as amended, you may withdraw from a distance sale within 14 calendar days of receipt without giving any reason. Tell us your decision in a clear statement, by letter, fax or email, before the deadline.",
          "Return the goods within 14 calendar days of notifying us. Products must be unused and in their original factory condition with packaging intact. Otherwise you may be liable for any reduction in their value. The direct cost of returning the products is paid by the customer.",
          "We refund all sums received, including standard delivery costs, within 14 calendar days, by bank transfer to the account you indicate. We may withhold the refund until the goods, or proof that you have sent them, reach us.",
        ],
      },
    ],
  },
  payment: {
    title: "Payment Methods",
    intro:
      "Choose whichever method suits you. All online payments are processed by Viva Wallet in a secure, SSL-encrypted environment.",
    sections: [
      {
        heading: "Credit or debit card",
        body: [
          "We accept all Visa and Mastercard credit and debit cards, with transactions secured by SSL through Viva Wallet. Enter your card number, expiry date and CVV on the secure checkout form. American Express is not accepted.",
        ],
      },
      {
        heading: "Klarna · Buy Now, Pay Later",
        body: ["Split your purchase into up to 3 interest-free instalments with Klarna. No credit card required."],
      },
      {
        heading: "Cash on delivery",
        body: [
          "Pay in cash when our courier delivers your order. The amount due includes any cash-on-delivery handling charge. Orders refused on delivery are returned to our premises.",
        ],
      },
      {
        heading: "Bank transfer",
        body: [
          "You can also pay by bank deposit through the secure Viva Wallet environment. Quote your order number and full name so we can match the payment, tell us once the deposit is made, and we dispatch as soon as it is verified.",
        ],
      },
    ],
  },
};

const gr: LegalDeck = {
  terms: {
    title: "Όροι Χρήσης & Απορρήτου",
    intro:
      "Η επίσκεψη στον παρόντα ιστότοπο και η χρήση του υλικού του συνεπάγονται την αποδοχή των παρακάτω όρων. Εάν δεν συμφωνείτε με αυτούς, παρακαλούμε μην κάνετε χρήση του ιστότοπου.",
    sections: [
      {
        heading: "1. Πνευματική ιδιοκτησία",
        body: [
          "Το περιεχόμενο του παρόντος ιστότοπου αποτελεί πνευματική ιδιοκτησία του bertolucci.com.gr, με επιφύλαξη κάθε δικαιώματος που δεν παραχωρείται ρητά. Το σύνολο των δικαιωμάτων πνευματικής ιδιοκτησίας επί του ιστότοπου ανήκει στην Berto Lucci ή σε νομίμως συνδεδεμένους τρίτους. Με την πρόσβασή σας στον ιστότοπο αποδέχεστε την ισχύουσα νομοθεσία περί πνευματικής ιδιοκτησίας.",
        ],
      },
      {
        heading: "2. Προσωπικά δεδομένα",
        body: [
          "Εφαρμόζουμε αυστηρά τις αρχές προστασίας δεδομένων της ευρωπαϊκής και της ελληνικής νομοθεσίας (ΓΚΠΔ, Οδηγία 2000/31/ΕΚ, Ν. 2251/1994 και Ν. 2472/1997). Δεν κάνουμε αθέμιτη χρήση των προσωπικών σας δεδομένων και δεν τα κοινοποιούμε, δημοσιεύουμε, πωλούμε, ενοικιάζουμε ή ανταλλάσσουμε με τρίτους. Κατόπιν αιτήματός σας, τα προσωπικά σας δεδομένα διαγράφονται οριστικά. Για κάθε ερώτημα σχετικά με τη συλλογή ή την επεξεργασία των δεδομένων σας, επικοινωνήστε στο info@bertolucci.com.gr.",
        ],
      },
      {
        heading: "3. Ιστότοποι τρίτων",
        body: [
          "Ο ιστότοπος ενδέχεται να περιέχει συνδέσμους προς ιστότοπους που ανήκουν ή λειτουργούν από τρίτους. Την ευθύνη για το περιεχόμενό τους φέρουν αποκλειστικά οι τρίτοι αυτοί.",
        ],
      },
      {
        heading: "4. Περιορισμός ευθύνης",
        body: [
          "Καταβάλλουμε κάθε προσπάθεια ώστε τα προϊόντα μας να απεικονίζονται όσο το δυνατόν πιστότερα, μέσω φωτογραφιών, περιγραφών και σχολίων. Παρόλα αυτά, ο ιστότοπος ενδέχεται να περιέχει σφάλματα τυπογραφικά, αριθμητικά ή στις εικόνες. Η Berto Lucci δεν εγγυάται την ακρίβεια ή την πληρότητα των απεικονίσεων και των περιγραφών, ούτε την αξιοπιστία οποιασδήποτε συμβουλής, γνώμης ή δήλωσης αναρτάται στον ιστότοπο.",
        ],
      },
      {
        heading: "5. Τιμές & ΦΠΑ",
        body: [
          "Όλες οι αναγραφόμενες τιμές περιλαμβάνουν ΦΠΑ 24% και αφορούν τις διαθέσιμες ποσότητες της αποθήκης μας. Η Berto Lucci διατηρεί το δικαίωμα αναπροσαρμογής των τιμών. Στις αγορές με δόσεις μέσω πιστωτικής κάρτας, η μηνιαία δόση προκύπτει από την τιμή του προϊόντος διαιρεμένη με τον αριθμό των δόσεων που επιλέγετε, χωρίς πρόσθετο τόκο.",
        ],
      },
      {
        heading: "6. Εφαρμοστέο δίκαιο",
        body: [
          "Κάθε συναλλαγή μέσω του bertolucci.com.gr διέπεται από το διεθνές και το ευρωπαϊκό δίκαιο για το ηλεκτρονικό εμπόριο (Οδηγία 2000/31/ΕΚ, Π.Δ. 131/2003) και από την ελληνική νομοθεσία για την προστασία του καταναλωτή (Ν. 2251/1994) όσον αφορά τις συμβάσεις από απόσταση.",
        ],
      },
      {
        heading: "7. Ερωτήσεις & παράπονα",
        body: [
          "Για κάθε παράπονο ή ερώτημα σχετικά με προϊόν που σκοπεύετε να αγοράσετε ή έχετε ήδη αγοράσει, καλέστε την Εξυπηρέτηση Πελατών στο +30 210 524 6634, Δευτέρα έως Παρασκευή 09:00 έως 17:00, ή γράψτε μας στο info@bertolucci.com.gr.",
        ],
      },
      {
        heading: "8. Στοιχεία επιχείρησης",
        body: [
          "Το ηλεκτρονικό κατάστημα Berto Lucci λειτουργεί η BLUE BELL Α.Ε.Β.Ε. Έδρα: Ερμού 37, Αθήνα 105 63. ΑΦΜ 999640058. Αρ. ΓΕΜΗ 004853001000. Τηλέφωνο +30 210 524 6634. Email info@bertolucci.com.gr.",
        ],
      },
    ],
  },
  shipping: {
    title: "Αποστολές & Παραδόσεις",
    intro:
      "Κάθε παραγγελία, είτε γίνει online είτε τηλεφωνικά, αποστέλλεται με τη συνεργαζόμενη εταιρεία ταχυμεταφορών ACS, με σημεία παραλαβής σε όλη την Ελλάδα.",
    sections: [
      {
        heading: "Κόστος αποστολής",
        body: [
          "Το κόστος αποστολής υπολογίζεται με βάση το σύνολο της παραγγελίας σας, όχι το βάρος του δέματος ή τον προορισμό.",
        ],
        bullets: [
          "€3,50 πάγια χρέωση για παραγγελίες έως €40.",
          "Δωρεάν αποστολή σε κάθε παραγγελία άνω των €40. Το κόστος το αναλαμβάνουμε εμείς.",
        ],
      },
      {
        heading: "Χρόνοι παράδοσης",
        body: [
          "Οι παρακάτω χρόνοι είναι ενδεικτικοί, αφορούν εργάσιμες ημέρες και υπολογίζονται από τη στιγμή που η παραγγελία σας θα αποσταλεί.",
          "Η αποστολή ενδέχεται να καθυστερήσει 3 έως 5 εργάσιμες ημέρες, εάν κάποιο προϊόν της παραγγελίας σας δεν είναι προσωρινά διαθέσιμο. Ελλιπή ή μη επιβεβαιωμένα στοιχεία πελάτη μπορούν επίσης να καθυστερήσουν μια παραγγελία.",
        ],
        bullets: [
          "1 έως 3 ημέρες για την Αττική και τις προσβάσιμες περιοχές της ηπειρωτικής Ελλάδας.",
          "2 έως 5 ημέρες για τα νησιά και τους δυσπρόσιτους προορισμούς.",
        ],
      },
      {
        heading: "Τρόποι παράδοσης",
        body: [
          "Παράδοση στο σπίτι: η παραγγελία σας φτάνει στην πόρτα σας με courier της ACS.",
          "Θυρίδες BoxNow: παραλαμβάνετε το δέμα σας 24 ώρες το 24ωρο από αυτόματες θυρίδες σε όλη την Ελλάδα.",
          "Παραλαβή από κατάστημα: διαθέσιμη εφόσον την επιλέξετε κατά την ολοκλήρωση της παραγγελίας. Η εξόφληση γίνεται online, με χρεωστική ή πιστωτική κάρτα, πριν από την παραλαβή.",
        ],
      },
      {
        heading: "Καθυστερήσεις & απώλεια δέματος",
        body: [
          "Η Berto Lucci δεν φέρει ευθύνη για συνέπειες που προκύπτουν από καθυστερήσεις της εταιρείας ταχυμεταφορών ή από απώλεια του δέματος. Εάν το δέμα δεν παραληφθεί εντός 7 εργάσιμων ημερών, ξεκινά έρευνα με τον μεταφορέα, η οποία μπορεί να διαρκέσει έως 10 ημέρες. Εάν το δέμα δεν εντοπιστεί, η παραγγελία ακυρώνεται και τυχόν πληρωμή με κάρτα επιστρέφεται εντός 7 ημερών από τη λήξη της προθεσμίας αυτής.",
        ],
      },
    ],
  },
  returns: {
    title: "Επιστροφές & Αλλαγές",
    intro:
      "Πώς επιστρέφετε ένα προϊόν, πώς κάνετε αλλαγή και πώς ασκείτε το νόμιμο δικαίωμα υπαναχώρησης.",
    sections: [
      {
        heading: "Με την παραλαβή της παραγγελίας",
        body: [
          "Ελέγξτε ότι τα προϊόντα αντιστοιχούν στην παραγγελία σας. Εάν κάτι δεν είναι σωστό, επικοινωνήστε μαζί μας την ίδια ημέρα ή το αργότερο την επόμενη εργάσιμη, στο +30 210 524 6634 ή στο info@bertolucci.com.gr.",
          "Εάν το προϊόν που παραδόθηκε δεν αντιστοιχεί σε αυτό που παραγγείλατε, λόγω λάθους στη λήψη της παραγγελίας, στην τιμή ή στην αποστολή, ή λόγω ελαττώματος, μπορείτε να το επιστρέψετε την ίδια ή την επόμενη εργάσιμη ημέρα. Το προϊόν πρέπει να είναι αχρησιμοποίητο, σε άριστη κατάσταση και με τη συσκευασία του ανέπαφη. Στις περιπτώσεις αυτές, τα έξοδα αποστολής για την επιστροφή και την αντικατάσταση τα αναλαμβάνουμε εμείς.",
        ],
      },
      {
        heading: "Αλλαγές",
        body: [
          "Για να αλλάξετε ένα προϊόν με άλλο, για λόγους μεγέθους ή σχεδίου, ενημερώστε μας εντός 14 ημερών από την παραλαβή, τηλεφωνικά ή με email. Κάθε αίτημα εξετάζεται ανάλογα με τη διαθεσιμότητα εντός της ίδιας σεζόν.",
        ],
        bullets: [
          "Τα έξοδα αποστολής για την αλλαγή βαρύνουν τον πελάτη. Με τη συνεργαζόμενη ACS το συνολικό κόστος και για τα δύο δέματα είναι €5,99, ενώ η παράδοση του νέου και η παραλαβή του παλιού δέματος γίνονται ταυτόχρονα.",
          "Οι αλλαγές γίνονται δωρεάν και στα δικά μας καταστήματα, εκτός δικτύου franchise, με την επίδειξη της απόδειξης αγοράς.",
          "Σε περιόδους εκπτώσεων, οι αλλαγές πραγματοποιούνται στην τρέχουσα τιμή των προϊόντων.",
          "Προϊόντα που αγοράστηκαν σε έκπτωση ή προσφορά αλλάζονται μόνο με προϊόντα που βρίσκονται επίσης σε έκπτωση ή προσφορά.",
          "Τα προϊόντα Outlet αλλάζονται μόνο με άλλα προϊόντα Outlet.",
        ],
      },
      {
        heading: "Δικαίωμα υπαναχώρησης",
        body: [
          "Σύμφωνα με τον Ν. 2251/1994, όπως ισχύει, μπορείτε να υπαναχωρήσετε από σύμβαση εξ αποστάσεως εντός 14 ημερολογιακών ημερών από την παραλαβή, χωρίς να αναφέρετε λόγο. Γνωστοποιήστε μας την απόφασή σας με σαφή δήλωση, με επιστολή, φαξ ή email, πριν από τη λήξη της προθεσμίας.",
          "Επιστρέψτε τα προϊόντα εντός 14 ημερολογιακών ημερών από τη γνωστοποίηση. Τα προϊόντα πρέπει να είναι αχρησιμοποίητα και στην αρχική, εργοστασιακή τους κατάσταση, με τη συσκευασία ανέπαφη. Σε διαφορετική περίπτωση ευθύνεστε για τυχόν μείωση της αξίας τους. Το άμεσο κόστος επιστροφής των προϊόντων βαρύνει τον πελάτη.",
          "Σας επιστρέφουμε κάθε ποσό που έχουμε λάβει, συμπεριλαμβανομένων των εξόδων παράδοσης με τον τυπικό τρόπο αποστολής, εντός 14 ημερολογιακών ημερών, με κατάθεση στον τραπεζικό λογαριασμό που θα μας υποδείξετε. Διατηρούμε το δικαίωμα να παρακρατήσουμε την επιστροφή χρημάτων έως ότου παραλάβουμε τα προϊόντα ή αποδεικτικό της αποστολής τους.",
        ],
      },
    ],
  },
  payment: {
    title: "Τρόποι Πληρωμής",
    intro:
      "Επιλέξτε τον τρόπο που σας εξυπηρετεί. Όλες οι online πληρωμές διεκπεραιώνονται από τη Viva Wallet, σε ασφαλές περιβάλλον με κρυπτογράφηση SSL.",
    sections: [
      {
        heading: "Πιστωτική ή χρεωστική κάρτα",
        body: [
          "Δεχόμαστε όλες τις πιστωτικές και χρεωστικές κάρτες Visa και Mastercard, με τις συναλλαγές να προστατεύονται με κρυπτογράφηση SSL μέσω της Viva Wallet. Συμπληρώνετε τον αριθμό της κάρτας, την ημερομηνία λήξης και το CVV στην ασφαλή φόρμα πληρωμής. Δεν γίνονται δεκτές κάρτες American Express.",
        ],
      },
      {
        heading: "Klarna · Πληρώστε Αργότερα",
        body: ["Μοιράστε την αγορά σας σε έως 3 άτοκες δόσεις με την Klarna. Δεν απαιτείται πιστωτική κάρτα."],
      },
      {
        heading: "Αντικαταβολή",
        body: [
          "Πληρώνετε με μετρητά κατά την παράδοση της παραγγελίας από τον courier. Το οφειλόμενο ποσό περιλαμβάνει τυχόν επιβάρυνση αντικαταβολής. Παραγγελίες που δεν παραλαμβάνονται κατά την παράδοση επιστρέφονται στις εγκαταστάσεις μας.",
        ],
      },
      {
        heading: "Τραπεζική κατάθεση",
        body: [
          "Μπορείτε επίσης να πληρώσετε με τραπεζική κατάθεση μέσω του ασφαλούς περιβάλλοντος της Viva Wallet. Αναγράψτε τον αριθμό παραγγελίας και το ονοματεπώνυμό σας ώστε να αντιστοιχίσουμε την πληρωμή, ενημερώστε μας μόλις ολοκληρωθεί η κατάθεση, και η παραγγελία αποστέλλεται μόλις αυτή επιβεβαιωθεί.",
        ],
      },
    ],
  },
};

const decks: Record<Lang, LegalDeck> = { en, gr };

export function getLegal(lang: Lang): LegalDeck {
  return decks[lang] ?? decks.en;
}
