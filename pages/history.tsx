import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Layout from '../components/Layout/Layout';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface History {
  _id: string;
  postId?: {
    _id: string;
    title: string;
  };
  requestId?: {
    _id: string;
    plantName: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  partnerId: {
    _id: string;
    name: string;
    email: string;
  };
  plantName: string;
  date: string;
  notes?: string;
  type: 'post' | 'request';
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Gagal memuat data history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus history ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/history/${historyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('History berhasil dihapus');
        fetchHistory();
      } else {
        toast.error('Gagal menghapus history');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleViewHistory = (historyItem: History) => {
    setSelectedHistory(historyItem);
    setShowModal(true);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      (item.plantName && item.plantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.userId?.name && item.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.partnerId?.name && item.partnerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === '' || item.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const itemDate = new Date(item.date);
      matchesDate = itemDate.toDateString() === filterDate.toDateString();
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeColor = (type: string) => {
    return type === 'post' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">History Transaksi</h1>
            <p className="mt-1 text-sm text-gray-600">
              Riwayat semua transaksi pertukaran yang telah selesai
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari history berdasarkan nama tanaman, nama user, atau catatan..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Semua Tipe</option>
                <option value="post">Post</option>
                <option value="request">Request</option>
              </select>
              
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.plantName || 'Unknown Plant'}
                      </div>
                      {item.type === 'post' && item.postId && (
                        <div className="text-sm text-gray-500">
                          Post: {item.postId.title || 'Untitled'}
                        </div>
                      )}
                      {item.type === 'request' && item.requestId && (
                        <div className="text-sm text-gray-500">
                          Request: {item.requestId.plantName || 'Unknown'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="font-medium">{item.userId?.name || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <span className="mr-1">↔</span>
                          <span>{item.partnerId?.name || 'Unknown Partner'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type === 'post' ? 'Post' : 'Request'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(item.date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.notes ? (
                        <div className="max-w-xs truncate" title={item.notes}>
                          {item.notes}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewHistory(item)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(item._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Tidak ada history ditemukan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || typeFilter || dateFilter 
                  ? 'Coba ubah filter pencarian' 
                  : 'Belum ada transaksi yang selesai'}
              </p>
            </div>
          )}
        </div>

        {/* History Detail Modal */}
        {showModal && selectedHistory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detail History Transaksi
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedHistory.plantName}
                    </h4>
                    
                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedHistory.type)}`}>
                        {selectedHistory.type === 'post' ? 'Post' : 'Request'}
                      </span>
                    </div>
                    
                    {selectedHistory.type === 'post' && selectedHistory.postId && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Post Terkait:</p>
                        <p className="text-sm text-gray-900">{selectedHistory.postId.title}</p>
                      </div>
                    )}
                    
                    {selectedHistory.type === 'request' && selectedHistory.requestId && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Request Terkait:</p>
                        <p className="text-sm text-gray-900">{selectedHistory.requestId.plantName}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">User:</p>
                        <p className="text-sm text-gray-900">{selectedHistory.userId?.name || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{selectedHistory.userId?.email || ''}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Partner:</p>
                        <p className="text-sm text-gray-900">{selectedHistory.partnerId?.name || 'Unknown Partner'}</p>
                        <p className="text-xs text-gray-500">{selectedHistory.partnerId?.email || ''}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Tanggal Transaksi:</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedHistory.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    
                    {selectedHistory.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Catatan:</p>
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {selectedHistory.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      handleDeleteHistory(selectedHistory._id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default HistoryPage;