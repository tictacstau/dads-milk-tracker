import React, { useState, useEffect } from 'react';
import { Clock, Droplet, Calculator, TrendingUp, Plus } from 'lucide-react';

export default function App() {
  const [unit, setUnit] = useState('ml');
  const [feeds, setFeeds] = useState([]);
  const [babyAge, setBabyAge] = useState(2);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [nextFeedTime, setNextFeedTime] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const feedsData = localStorage.getItem('feeds');
      const settingsData = localStorage.getItem('settings');
      
      if (feedsData) {
        const parsed = JSON.parse(feedsData);
        setFeeds(parsed);
        
        if (parsed.length > 0) {
          const lastFeed = parsed[parsed.length - 1];
          const nextTime = new Date(lastFeed.timestamp);
          nextTime.setHours(nextTime.getHours() + 3);
          setNextFeedTime(nextTime);
        }
      }
      
      if (settingsData) {
        const parsed = JSON.parse(settingsData);
        setUnit(parsed.unit || 'ml');
        setBabyAge(parsed.babyAge || 2);
      }
    } catch (error) {
      console.log('First time loading, starting fresh');
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({ unit, babyAge }));
  }, [unit, babyAge]);

  // Update countdown timer
  const [timeUntilFeed, setTimeUntilFeed] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextFeedTime) {
        const now = new Date();
        const diff = nextFeedTime - now;
        
        if (diff <= 0) {
          setTimeUntilFeed('Feed time!');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilFeed(`${hours}h ${minutes}m`);
        }
      } else {
        setTimeUntilFeed('Log first feed');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [nextFeedTime]);

  // Recommended amounts based on age (in ml)
  const getRecommendedAmount = () => {
    if (babyAge <= 1) return 60;
    if (babyAge <= 2) return 90;
    if (babyAge <= 4) return 120;
    if (babyAge <= 8) return 150;
    return 180;
  };

  const mlToOz = (ml) => (ml * 0.033814).toFixed(1);
  const ozToMl = (oz) => Math.round(oz * 29.5735);

  const convert = (amount) => {
    return unit === 'ml' ? amount : mlToOz(amount);
  };

  const logFeed = (amount) => {
    const newFeed = {
      timestamp: new Date().toISOString(),
      amount: unit === 'oz' ? ozToMl(amount) : amount,
      unit: unit
    };
    
    const updatedFeeds = [...feeds, newFeed];
    setFeeds(updatedFeeds);
    
    localStorage.setItem('feeds', JSON.stringify(updatedFeeds));
    
    const nextTime = new Date();
    nextTime.setHours(nextTime.getHours() + 3);
    setNextFeedTime(nextTime);
    
    setShowQuickLog(false);
    setCustomAmount('');
  };

  const getTodayFeeds = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return feeds.filter(feed => {
      const feedDate = new Date(feed.timestamp);
      return feedDate >= today;
    });
  };

  const todayFeeds = getTodayFeeds();
  const todayTotal = todayFeeds.reduce((sum, feed) => sum + feed.amount, 0);
  const recommendedDaily = getRecommendedAmount() * 8;

  const calculateFormula = (targetMl) => {
    const scoops = Math.round(targetMl / 30);
    const water = scoops * 30;
    return { scoops, water };
  };

  const recommended = getRecommendedAmount();
  const quickLogAmounts = [
    Math.round(recommended * 0.75),
    recommended,
    Math.round(recommended * 1.25)
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      color: '#1a1a1a'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Dad's Milk Tracker
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#666',
            fontWeight: 500
          }}>
            You got this, Dad 💪
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Settings Bar */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#666',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Baby's Age (weeks)
            </label>
            <input
              type="number"
              value={babyAge}
              onChange={(e) => setBabyAge(parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#666',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Units
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['ml', 'oz'].map(u => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: unit === u ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
                    color: unit === u ? 'white' : '#666',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase'
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          border: '3px solid #667eea'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Clock size={28} color="#667eea" />
            <h2 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#667eea',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Next Feeding
            </h2>
          </div>
          <div style={{
            fontSize: '64px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px',
            marginBottom: '8px'
          }}>
            {timeUntilFeed}
          </div>
          {nextFeedTime && (
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#999',
              fontWeight: 500
            }}>
              Around {nextFeedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Quick Log Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Droplet size={24} color="#667eea" />
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#333'
            }}>
              Quick Log Feed
            </h3>
          </div>

          {!showQuickLog ? (
            <button
              onClick={() => setShowQuickLog(true)}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              <Plus size={20} />
              Log Feed Now
            </button>
          ) : (
            <div>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#666',
                fontWeight: 500
              }}>
                Recommended: {convert(recommended)}{unit} per feeding
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '12px'
              }}>
                {quickLogAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => logFeed(amount)}
                    style={{
                      padding: '16px 12px',
                      border: '2px solid #667eea',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: 'white',
                      color: '#667eea',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#667eea';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#667eea';
                    }}
                  >
                    {convert(amount)}{unit}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder={`Custom amount (${unit})`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button
                  onClick={() => customAmount && logFeed(parseFloat(customAmount))}
                  disabled={!customAmount}
                  style={{
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: customAmount ? 'pointer' : 'not-allowed',
                    background: customAmount ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                    color: 'white',
                    opacity: customAmount ? 1 : 0.5
                  }}
                >
                  Log
                </button>
              </div>
              <button
                onClick={() => setShowQuickLog(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: '#f5f5f5',
                  color: '#666'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Formula Calculator */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showCalculator ? '16px' : 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calculator size={24} color="#667eea" />
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#333'
              }}>
                Formula Calculator
              </h3>
            </div>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              style={{
                padding: '8px 16px',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'white',
                color: '#667eea'
              }}
            >
              {showCalculator ? 'Hide' : 'Show'}
            </button>
          </div>

          {showCalculator && (
            <div style={{
              padding: '20px',
              background: '#f8f9ff',
              borderRadius: '12px',
              border: '2px solid #e8ebff'
            }}>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                color: '#666',
                fontWeight: 500
              }}>
                For {convert(recommended)}{unit} of milk:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '2px solid #667eea'
                }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#667eea',
                    marginBottom: '4px'
                  }}>
                    {calculateFormula(unit === 'ml' ? recommended : ozToMl(recommended)).scoops}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Scoops
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '2px solid #667eea'
                }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#667eea',
                    marginBottom: '4px'
                  }}>
                    {convert(calculateFormula(unit === 'ml' ? recommended : ozToMl(recommended)).water)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {unit} Water
                  </div>
                </div>
              </div>
              <p style={{
                margin: '12px 0 0 0',
                fontSize: '12px',
                color: '#999',
                fontStyle: 'italic'
              }}>
                Standard ratio: 1 scoop per 30ml (1oz) water
              </p>
            </div>
          )}
        </div>

        {/* Daily Tracker Dashboard */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <TrendingUp size={24} color="#667eea" />
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#333'
            }}>
              Today's Progress
            </h3>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}>
                {convert(todayTotal)}{unit} / {convert(recommendedDaily)}{unit}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#667eea'
              }}>
                {Math.round((todayTotal / recommendedDaily) * 100)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#e0e0e0',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((todayTotal / recommendedDaily) * 100, 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '16px',
              background: '#f8f9ff',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#667eea',
                marginBottom: '4px'
              }}>
                {todayFeeds.length}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Feeds
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: '#f8f9ff',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#667eea',
                marginBottom: '4px'
              }}>
                {todayFeeds.length > 0 ? convert(Math.round(todayTotal / todayFeeds.length)) : 0}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Avg {unit}
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: todayTotal >= recommendedDaily ? '#d4edda' : '#f8f9ff',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 800,
                color: todayTotal >= recommendedDaily ? '#28a745' : '#667eea',
                marginBottom: '4px'
              }}>
                {todayTotal >= recommendedDaily ? '✓' : '○'}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Goal
              </div>
            </div>
          </div>

          {/* Feed History */}
          {todayFeeds.length > 0 && (
            <>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 700,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Today's Feeds
              </h4>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {[...todayFeeds].reverse().map((feed, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: '#f8f9ff',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#333'
                    }}>
                      {new Date(feed.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#667eea'
                    }}>
                      {convert(feed.amount)}{unit}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {todayFeeds.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#999'
            }}>
              <Droplet size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 500
              }}>
                No feeds logged today yet. You got this!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
