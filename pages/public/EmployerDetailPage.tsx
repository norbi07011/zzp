import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingOverlay } from '../../components/Loading';
import { MapPin, Briefcase, User } from '../../components/icons';

export default function EmployerDetailPage() {
  const { id } = useParams();
  const [employer, setEmployer] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadEmployer(id);
  }, [id]);

  const loadEmployer = async (employerId: string) => {
    setLoading(true);
    try {
      const { data: emp, error: empErr } = await supabase
        .from('employers')
        .select('*')
        .eq('id', employerId)
        .single();

      if (empErr) throw empErr;
      setEmployer(emp);

      const { data: jobData, error: jobErr } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

      if (jobErr) throw jobErr;
      setJobs(jobData || []);
    } catch (err) {
      console.error('Error loading employer:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay isLoading={true} message="Ładowanie profilu pracodawcy..." />;

  if (!employer) return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-semibold">Nie znaleziono pracodawcy</h2>
      <p className="text-gray-600">Sprawdź listę pracodawców lub wróć do wyszukiwania.</p>
      <Link to="/employers" className="mt-4 inline-block text-amber-600">Powrót do listy</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {employer.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employer.logo_url} alt={employer.company_name} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{employer.company_name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              {employer.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{employer.city}{employer.country ? `, ${employer.country}` : ''}</span>}
              {employer.company_size && <span className="flex items-center gap-1"><User className="w-4 h-4" />{employer.company_size}</span>}
            </div>
          </div>
        </div>

        {employer.description && (
          <div className="mt-6 text-gray-700">
            <h3 className="font-semibold mb-2">O firmie</h3>
            <p className="whitespace-pre-line">{employer.description}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Aktualne oferty pracy ({jobs.length})</h3>
          {jobs.length === 0 ? (
            <div className="text-gray-600">Brak aktywnych ofert.</div>
          ) : (
            <ul className="space-y-3">
              {jobs.map(j => (
                <li key={j.id} className="p-3 border rounded bg-gray-50">
                  <Link to={`/job/${j.id}`} className="font-medium text-amber-600">{j.title}</Link>
                  <div className="text-sm text-gray-600">{j.location_city || ''} • {j.specialization || ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6">
          <Link to="/employers" className="text-amber-600">Powrót do wyszukiwania pracodawców</Link>
        </div>
      </div>
    </div>
  );
}
