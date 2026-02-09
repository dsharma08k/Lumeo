
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedResult } from '../services/api';
import ComparisonView from './ComparisonView';
import { Loader2, ArrowLeft } from 'lucide-react';

const SharedResult = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const result = await getSharedResult(id);
                setData(result);
            } catch (err) {
                console.error(err);
                setError("Shared result not found or expired.");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    if (loading) {
        return (
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="spin" color="var(--accent)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#f87171' }}>404 Not Found</h2>
                <p>{error}</p>
                <Link to="/" style={{ color: 'var(--accent)', marginTop: '1rem', display: 'inline-block' }}>Go Home</Link>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="glass-panel">
                <div style={{ marginBottom: '1rem' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <ArrowLeft size={16} />
                        Try Lumeo Yourself
                    </Link>
                </div>

                <div style={{ height: '500px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '800px', height: '100%' }}>
                        <ComparisonView
                            original={data.original_url}
                            enhanced={data.enhanced_url}
                        />
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.7 }}>
                    <p style={{ fontSize: '0.9rem' }}>Shared via Lumeo - Low Light Image Enhancement</p>
                </div>
            </div>
        </div>
    );
};

export default SharedResult;
