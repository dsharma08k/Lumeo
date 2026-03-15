
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
            <div className="glass-panel shared-state-panel">
                <Loader2 size={48} className="spin" color="var(--accent)" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel shared-state-panel shared-state-error">
                <h2>404 Not Found</h2>
                <p>{error}</p>
                <Link to="/" className="shared-home-link">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="glass-panel">
                <div className="shared-topbar">
                    <Link to="/" className="shared-back-link">
                        <ArrowLeft size={16} />
                        Try Lumeo Yourself
                    </Link>
                </div>

                <div className="shared-result-wrap">
                    <div className="shared-result-inner">
                        <ComparisonView
                            original={data.original_url}
                            enhanced={data.enhanced_url}
                        />
                    </div>
                </div>

                <div className="shared-footnote">
                    <p>Shared via Lumeo - Low Light Image Enhancement</p>
                </div>
            </div>
        </div>
    );
};

export default SharedResult;
