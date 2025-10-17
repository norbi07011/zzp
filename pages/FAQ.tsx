import React, { useState } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Dla specjalistów',
    question: 'Jak mogę zarejestrować się jako specjalista?',
    answer: 'Kliknij "Rejestracja" w prawym górnym rogu, wybierz "Jestem specjalistą", wypełnij formularz z danymi osobowymi i zawodowymi. Po weryfikacji Twojego profilu będziesz mógł aplikować na zlecenia.'
  },
  {
    category: 'Dla specjalistów',
    question: 'Ile kosztuje korzystanie z platformy dla specjalistów?',
    answer: 'Oferujemy dwa plany: Basic (bezpłatny) z podstawowymi funkcjami i Plus (€29.99/miesiąc) z dodatkowymi funkcjami jak priorytetowe wyświetlanie, zaawansowane statystyki i brak prowizji od zleceń.'
  },
  {
    category: 'Dla specjalistów',
    question: 'Jak działa proces weryfikacji?',
    answer: 'Proces weryfikacji składa się z trzech etapów: 1) Sprawdzenie dokumentów i certyfikatów, 2) Test wiedzy teoretycznej online, 3) Opcjonalna weryfikacja praktyczna. Proces trwa zazwyczaj 3-5 dni roboczych.'
  },
  {
    category: 'Dla specjalistów',
    question: 'Czy mogę pracować jako specjalista jeśli nie mam VCA?',
    answer: 'Tak, możesz! VCA nie jest obowiązkowe dla wszystkich kategorii. Oferujemy jednak kursy VCA przez naszą platformę, które mogą zwiększyć Twoje szanse na otrzymanie zleceń.'
  },
  {
    category: 'Dla klientów',
    question: 'Jak znaleźć odpowiedniego specjalistę?',
    answer: 'Użyj naszej zaawansowanej wyszukiwarki z filtrami (kategoria, lokalizacja, cena, dostępność). Możesz przeglądać profile, sprawdzać opinie i bezpośrednio kontaktować się ze specjalistami.'
  },
  {
    category: 'Dla klientów',
    question: 'Ile kosztuje zatrudnienie specjalisty?',
    answer: 'Ceny ustalane są indywidualnie przez specjalistów. Średnie stawki godzinowe wynoszą €45-85 w zależności od kategorii i poziomu doświadczenia. Nie pobieramy dodatkowych opłat - płacisz tylko uzgodnioną cenę.'
  },
  {
    category: 'Dla klientów',
    question: 'Czy specjaliści są ubezpieczeni?',
    answer: 'Wszyscy zweryfikowani specjaliści muszą posiadać odpowiednie ubezpieczenie OC. Weryfikujemy to podczas procesu rejestracji. Możesz zawsze poprosić o potwierdzenie ubezpieczenia.'
  },
  {
    category: 'Dla klientów',
    question: 'Co jeśli nie jestem zadowolony z pracy specjalisty?',
    answer: 'Jeśli występują problemy, najpierw skontaktuj się bezpośrednio ze specjalistą. Jeśli to nie pomoże, skorzystaj z naszego centrum mediacji. Chronimy prawa obu stron i dążymy do uczciwego rozwiązania.'
  },
  {
    category: 'Płatności',
    question: 'Jakie metody płatności są akceptowane?',
    answer: 'Akceptujemy iDEAL, karty kredytowe/debetowe, SEPA Direct Debit i PayPal. Wszystkie płatności są bezpiecznie przetwarzane przez Stripe/Mollie.'
  },
  {
    category: 'Płatności',
    question: 'Kiedy muszę zapłacić za zlecenie?',
    answer: 'Płatność następuje po wykonaniu usługi i akceptacji przez klienta. Możliwe są też płatności milestone\'owe dla większych projektów. Środki są bezpiecznie przechowywane w systemie escrow.'
  },
  {
    category: 'Płatności',
    question: 'Czy mogę anulować subskrypcję?',
    answer: 'Tak, możesz anulować subskrypcję w dowolnym momencie w ustawieniach konta. Anulacja zacznie obowiązywać od następnego okresu rozliczeniowego. Nie zwracamy środków za bieżący okres.'
  },
  {
    category: 'Techniczne',
    question: 'Czy mogę korzystać z platformy na telefonie?',
    answer: 'Tak! Nasza platforma jest w pełni responsywna i działa na wszystkich urządzeniach. Wkrótce uruchomimy również dedykowane aplikacje mobilne dla iOS i Android.'
  },
  {
    category: 'Techniczne',
    question: 'Jak mogę usunąć swoje konto?',
    answer: 'Przejdź do Ustawienia > Strefa niebezpieczna > Usuń konto. Pamiętaj, że usunięcie konta jest nieodwracalne i wszystkie Twoje dane zostaną trwale usunięte.'
  },
  {
    category: 'Techniczne',
    question: 'Czy moje dane są bezpieczne?',
    answer: 'Tak! Używamy szyfrowania SSL, przestrzegamy GDPR i regularnie przeprowadzamy audyty bezpieczeństwa. Twoje dane nigdy nie są udostępniane stronom trzecim bez Twojej zgody.'
  },
  {
    category: 'Weryfikacja',
    question: 'Ile trwa proces weryfikacji specjalisty?',
    answer: 'Standardowy proces weryfikacji trwa 3-5 dni roboczych. W przypadku specjalistów z kompletnymi dokumentami i certyfikatami może to być szybsze (1-2 dni).'
  },
  {
    category: 'Weryfikacja',
    question: 'Co jeśli nie zdam testu weryfikacyjnego?',
    answer: 'Możesz powtórzyć test po 30 dniach. Otrzymasz informację zwrotną o obszarach do poprawy. Oferujemy również materiały szkoleniowe, które pomogą Ci się przygotować.'
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Często zadawane pytania</h1>
          <p className="text-lg text-gray-600">
            Znajdź odpowiedzi na najczęściej zadawane pytania o naszą platformę
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj pytań..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-none focus:outline-none focus:ring-0 text-gray-900"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded mb-2">
                      {faq.category}
                    </span>
                    <p className="font-semibold text-gray-900">{faq.question}</p>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transform transition-transform flex-shrink-0 ml-4 ${
                      openItems.has(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openItems.has(index) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Nie znaleziono pytań pasujących do Twojego wyszukiwania.</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Nie znalazłeś odpowiedzi?</h2>
          <p className="text-primary-100 mb-6">
            Nasz zespół wsparcia jest zawsze gotowy, aby Ci pomóc
          </p>
          <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Skontaktuj się z nami
          </button>
        </div>
      </div>
    </div>
  );
};
