import React, { useState, useEffect } from 'react';
import { governmentIntegrationService, DIKSHAContent } from '../../src/services/GovernmentIntegrationService';
import { Icons } from '../Icons';

export const GovernmentResourcesPanel: React.FC = () => {
  const [resources, setResources] = useState<DIKSHAContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    board: 'CBSE',
    grade: 'Class 10',
    subject: 'Mathematics',
  });

  useEffect(() => {
    searchResources();
  }, []);

  const searchResources = async () => {
    setLoading(true);
    try {
      const results = await governmentIntegrationService.searchDIKSHAContent({
        board: searchParams.board,
        gradeLevel: searchParams.grade,
        subject: searchParams.subject,
        limit: 20,
      });
      setResources(results);
    } catch (error) {
      console.error('Error searching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSSO = async () => {
    const result = await governmentIntegrationService.authenticateWithSSO('diksha');
    if (result.success) {
      alert('Successfully connected to DIKSHA!');
    } else {
      alert(`Connection failed: ${result.error}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50 to-teal-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-green-200 bg-white/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
          <Icons.Globe size={28} />
          Government Resources
        </h2>
        <p className="text-green-600 mt-1">Access DIKSHA and state educational content</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* DIKSHA Integration */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">DIKSHA Platform</h3>
              <p className="text-sm text-gray-600">Digital Infrastructure for Knowledge Sharing</p>
            </div>
            <button
              onClick={connectSSO}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
            >
              Connect Account
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <Icons.Check size={16} />
            <span>Official government educational platform</span>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Search Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Board</label>
              <select
                value={searchParams.board}
                onChange={(e) => setSearchParams({ ...searchParams, board: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
              <select
                value={searchParams.grade}
                onChange={(e) => setSearchParams({ ...searchParams, grade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade}>Class {grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <select
                value={searchParams.subject}
                onChange={(e) => setSearchParams({ ...searchParams, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Biology</option>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>
          <button
            onClick={searchResources}
            disabled={loading}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Resources'}
          </button>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.identifier} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{resource.name}</h4>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
                <div className="ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    resource.contentType === 'Resource'
                      ? 'bg-blue-100 text-blue-700'
                      : resource.contentType === 'Collection'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {resource.contentType}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {resource.board}
                </span>
                {resource.gradeLevel.map((grade) => (
                  <span key={grade} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {grade}
                  </span>
                ))}
                {resource.subject.map((subject) => (
                  <span key={subject} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {subject}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open(resource.artifactUrl, '_blank')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <Icons.ExternalLink size={16} />
                  View on DIKSHA
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold">
                  Save for Later
                </button>
              </div>
            </div>
          ))}

          {resources.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Icons.Search size={48} className="mx-auto mb-3 opacity-50" />
              <p>No resources found. Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
