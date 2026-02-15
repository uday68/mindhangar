import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      <h1>MindHangar Backend API</h1>
      <p>
        Production-ready authentication and API backend for MindHangar AI for Bharat platform.
      </p>
      
      <h2>Status</h2>
      <p>
        <Link href="/api/health" style={{ color: '#0070f3' }}>
          Check API Health →
        </Link>
      </p>
      
      <h2>Available Endpoints</h2>
      <ul>
        <li><code>GET /api/health</code> - Health check</li>
        <li><code>GET /api/auth/*</code> - Authentication (coming soon)</li>
        <li><code>GET /api/users/*</code> - User management (coming soon)</li>
        <li><code>GET /api/courses/*</code> - Course management (coming soon)</li>
        <li><code>GET /api/progress/*</code> - Progress tracking (coming soon)</li>
        <li><code>GET /api/sync/*</code> - Data synchronization (coming soon)</li>
      </ul>
      
      <h2>Documentation</h2>
      <p>
        See <code>README.md</code> for setup instructions and API documentation.
      </p>
      
      <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          MindHangar Backend v1.0.0 | Built with Next.js 15
        </p>
      </footer>
    </div>
  );
}
