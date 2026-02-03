'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
    onLogin: (password: string) => void;
}

export default function LoginScreen({ onLogin }: LoginProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            setError('패스워드를 입력해주세요');
            return;
        }

        onLogin(password);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg-card)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-light)'
            }}>
                {/* Logo */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, var(--primary), #8f75ff)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(108, 93, 211, 0.4)'
                }}>
                    <Lock size={42} color="white" />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '8px',
                    color: 'var(--text-main)'
                }}>
                    ComCard
                </h1>

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    marginBottom: '32px'
                }}>
                    법인카드 관리 시스템에 오신 것을 환영합니다
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-main)'
                        }}>
                            패스워드
                        </label>

                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="패스워드를 입력하세요"
                                style={{
                                    width: '100%',
                                    padding: '14px 45px 14px 16px',
                                    borderRadius: '12px',
                                    border: error ? '2px solid var(--error)' : '2px solid var(--border-light)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-main)',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                autoFocus
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Hint */}
                        <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: 'var(--text-muted)'
                        }}>
                            💡 힌트: <span style={{ color: '#8f75ff' }}>여신님</span>
                        </div>

                        {error && (
                            <div style={{
                                marginTop: '8px',
                                color: 'var(--error)',
                                fontSize: '13px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary), #8f75ff)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(108, 93, 211, 0.4)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 93, 211, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(108, 93, 211, 0.4)';
                        }}
                    >
                        로그인
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    🔒 보안 접속 · 인증된 사용자만 접근 가능
                </div>
            </div>
        </div>
    );
}
