import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fingerprint, Eye, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { webauthnService } from '@/services/api/webauthnService';

interface BiometricCapability {
  available: boolean;
  type: 'fingerprint' | 'face' | 'platform' | 'none';
  name: string;
  icon: React.ComponentType<any>;
}

export const BiometricLogin: React.FC = () => {
  const [capability, setCapability] = useState<BiometricCapability>({
    available: false,
    type: 'none',
    name: 'None',
    icon: AlertCircle,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEnrollment, setIsEnrollment] = useState(false);
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();

  const detectBiometricCapability = async (): Promise<BiometricCapability> => {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      return {
        available: false,
        type: 'none',
        name: 'WebAuthn not supported',
        icon: AlertCircle,
      };
    }

    try {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (!available) {
        return {
          available: false,
          type: 'none',
          name: 'No biometric authenticator',
          icon: AlertCircle,
        };
      }

      // Detect the type of biometric available
      const userAgent = navigator.userAgent.toLowerCase();
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        return {
          available: true,
          type: 'face',
          name: 'Face ID / Touch ID',
          icon: Eye,
        };
      } else if (userAgent.includes('android')) {
        return {
          available: true,
          type: 'fingerprint',
          name: 'Fingerprint / Face Unlock',
          icon: Fingerprint,
        };
      } else if (userAgent.includes('windows')) {
        return {
          available: true,
          type: 'platform',
          name: 'Windows Hello',
          icon: Smartphone,
        };
      } else if (userAgent.includes('mac')) {
        return {
          available: true,
          type: 'fingerprint',
          name: 'Touch ID',
          icon: Fingerprint,
        };
      }

      return {
        available: true,
        type: 'platform',
        name: 'Platform Authenticator',
        icon: Smartphone,
      };
    } catch (error) {
      console.error('Error detecting biometric capability:', error);
      return {
        available: false,
        type: 'none',
        name: 'Detection failed',
        icon: AlertCircle,
      };
    }
  };

  useEffect(() => {
    detectBiometricCapability().then(setCapability);
  }, []);

  const handleBiometricAuth = async () => {
    if (!capability.available) {
      setError('Biometric authentication not available');
      return;
    }

    const userId = user?.id || profile?.id;
    const userEmail = user?.email || profile?.email;

    if (!userId || !userEmail) {
      setError('User information unavailable. Please sign in using another method first.');
      setIsEnrollment(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate random challenge for demo
      const challengeBytes = new Uint8Array(32);
      crypto.getRandomValues(challengeBytes);
      const challengeHex = Array.from(challengeBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // In a real app, you'd get these options from your server
      const authenticationOptions = {
        challenge: challengeHex,
        timeout: 60000,
        rpId: window.location.hostname,
        allowCredentials: [], // Should contain registered credential IDs
        userVerification: 'required' as const,
      };

      const authResponse = await startAuthentication({
        optionsJSON: authenticationOptions
      });

      const verifyResult = await webauthnService.authenticate({
        userId,
        email: userEmail,
        credential: {
          credentialId: authResponse.id,
          signature: authResponse.response.signature,
          authenticatorData: authResponse.response.authenticatorData,
        },
        challenge: authenticationOptions.challenge,
      });

      if (!verifyResult.success) {
        const failureMessage =
          verifyResult.data?.error ||
          verifyResult.error ||
          verifyResult.data?.message ||
          'Biometric authentication failed';

        setError(failureMessage);

        if (failureMessage.toLowerCase().includes('credential')) {
          setIsEnrollment(true);
        }

        return;
      }

      const loginEmail = verifyResult.data?.email || userEmail;
      const { error } = await signIn(loginEmail, 'biometric-auth');

      if (!error) {
        setError('');
        navigate('/');
      } else {
        setError(error.message || 'Biometric authentication failed');
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);

      if (error?.name === 'NotAllowedError') {
        setError('Authentication was cancelled or timed out');
      } else if (error?.name === 'InvalidStateError') {
        setError('Invalid authentication state. Try enrolling first.');
        setIsEnrollment(true);
      } else {
        setError(error?.message || 'Biometric authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricEnrollment = async () => {
    if (!capability.available) {
      setError('Biometric authentication not available');
      return;
    }

    const userId = user?.id || profile?.id;
    const userEmail = user?.email || profile?.email;

    if (!userId || !userEmail) {
      setError('User information unavailable. Please sign in before enrolling biometrics.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate random values for demo
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const challengeHex = Array.from(challenge)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // In a real app, you'd get these options from your server
      const registrationOptions = {
        challenge: challengeHex,
        rp: {
          name: 'CHIMERA-TEC Security System',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: userEmail,
          displayName: profile?.character_name || userEmail,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' as const },
          { alg: -257, type: 'public-key' as const },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as const,
          userVerification: 'required' as const,
        },
        timeout: 60000,
      };

      const registrationResponse = await startRegistration({
        optionsJSON: registrationOptions
      });

      // Send registrationResponse to server for verification and storage
      const storeResult = await webauthnService.register({
        userId,
        email: userEmail,
        credential: {
          credentialId: registrationResponse.id,
          publicKey: registrationResponse.response.publicKey,
          deviceName: `${capability.name} on ${navigator.platform}`,
        },
      });

      if (!storeResult.success) {
        const failureMessage =
          storeResult.data?.error ||
          storeResult.error ||
          storeResult.data?.message ||
          'Biometric enrollment failed';

        setError(failureMessage);
        return;
      }

      setIsEnrollment(false);
      const successMessage =
        storeResult.data?.message ||
        'Biometric enrollment successful! You can now use biometric authentication.';
      setError(successMessage);
    } catch (error: any) {
      console.error('Biometric enrollment error:', error);

      if (error.name === 'NotAllowedError') {
        setError('Enrollment was cancelled or timed out');
      } else {
        setError('Biometric enrollment failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = capability.icon;

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="pip-terminal" className="p-pip-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <IconComponent className={`h-12 w-12 ${capability.available ? 'text-primary' : 'text-pip-text-muted'} pip-text-glow`} />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              BIOMETRIC ACCESS
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              {capability.available ? capability.name : 'Biometric authentication unavailable'}
            </p>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${
              capability.available 
                ? 'border-primary bg-primary/20 text-primary' 
                : 'border-destructive bg-destructive/20 text-destructive'
            }`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${
                capability.available ? 'bg-primary' : 'bg-destructive'
              } ${capability.available ? 'animate-pulse' : ''}`} />
              <span className="font-mono text-sm font-bold">
                {capability.available ? 'READY' : 'UNAVAILABLE'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-6">
              <p className={`text-sm font-mono pip-text-glow ${
                error.includes('successful') ? 'text-primary' : 'text-destructive'
              }`}>
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {capability.available && (
              <>
                {isEnrollment ? (
                  <Button
                    onClick={handleBiometricEnrollment}
                    disabled={isLoading}
                    className="w-full pip-button-glow font-mono font-bold text-base py-3"
                  >
                    {isLoading ? 'ENROLLING...' : 'ENROLL BIOMETRIC'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleBiometricAuth}
                    disabled={isLoading}
                    className="w-full pip-button-glow font-mono font-bold text-base py-3"
                  >
                    {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                  </Button>
                )}
                
                <Button
                  onClick={() => setIsEnrollment(!isEnrollment)}
                  variant="outline"
                  className="w-full pip-terminal border-pip-border font-mono"
                  disabled={isLoading}
                >
                  {isEnrollment ? 'BACK TO LOGIN' : 'ENROLL NEW BIOMETRIC'}
                </Button>
              </>
            )}
            
            {!capability.available && (
              <div className="text-center">
                <p className="text-pip-text-muted font-mono text-sm mb-4">
                  Your device doesn't support biometric authentication or no biometrics are enrolled.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="pip-terminal border-pip-border font-mono"
                >
                  RETRY DETECTION
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-pip-text-muted font-mono text-xs">
              {capability.available 
                ? 'Follow your device prompts for biometric verification'
                : 'Ensure biometrics are enabled in device settings'
              }
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};