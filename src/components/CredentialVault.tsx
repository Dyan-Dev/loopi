import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, 
  Shield, 
  Key, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Lock,
  AlertTriangle
} from 'lucide-react';
import type { Credential } from '../app';

interface CredentialVaultProps {
  credentials: Credential[];
  onUpdateCredentials: (credentials: Credential[]) => void;
  onBack: () => void;
}

export function CredentialVault({ credentials, onUpdateCredentials, onBack }: CredentialVaultProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [newCredential, setNewCredential] = useState({
    name: '',
    type: 'username_password' as Credential['type'],
    values: {} as Record<string, string>
  });

  const credentialTypes = [
    { value: 'username_password', label: 'Username/Password', fields: ['username', 'password'] },
    { value: 'api_key', label: 'API Key', fields: ['apiKey'] },
    { value: 'oauth_token', label: 'OAuth Token', fields: ['accessToken', 'refreshToken'] },
    { value: 'custom', label: 'Custom', fields: ['value'] }
  ] as const;

  const getTypeInfo = (type: Credential['type']) => {
    return credentialTypes.find(t => t.value === type) || credentialTypes[0];
  };

  const handleCreateCredential = () => {
    if (!newCredential.name.trim()) return;
    
    const credential: Credential = {
      id: Date.now().toString(),
      name: newCredential.name,
      type: newCredential.type,
      lastUpdated: new Date(),
      // In real app, these would be encrypted before storage
      encryptedValues: Object.fromEntries(
        Object.entries(newCredential.values).map(([key, value]) => [
          key, 
          '•'.repeat(Math.min(value.length, 16)) // Mock encryption display
        ])
      )
    };

    onUpdateCredentials([...credentials, credential]);
    setNewCredential({ name: '', type: 'username_password', values: {} });
    setIsCreating(false);
  };

  const handleDeleteCredential = (id: string) => {
    onUpdateCredentials(credentials.filter(c => c.id !== id));
  };

  const toggleShowValue = (credentialId: string, field: string) => {
    const key = `${credentialId}-${field}`;
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getTypeIcon = (type: Credential['type']) => {
    switch (type) {
      case 'username_password': return <Key className="h-4 w-4" />;
      case 'api_key': return <Shield className="h-4 w-4" />;
      case 'oauth_token': return <Lock className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Credential Vault</h1>
            <p className="text-muted-foreground">Securely manage your automation credentials</p>
          </div>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Credential</DialogTitle>
              <DialogDescription>
                Store encrypted credentials for use in your automations
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cred-name">Name</Label>
                <Input
                  id="cred-name"
                  placeholder="e.g., Gmail Login, Twitter API"
                  value={newCredential.name}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={newCredential.type} 
                  onValueChange={(value) => {
                    setNewCredential(prev => ({ 
                      ...prev, 
                      type: value as Credential['type'],
                      values: {} // Reset values when type changes
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {credentialTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {getTypeInfo(newCredential.type).fields.map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`cred-${field}`}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={`cred-${field}`}
                    type={field.includes('password') || field.includes('token') || field.includes('key') ? 'password' : 'text'}
                    placeholder={`Enter ${field}`}
                    value={newCredential.values[field] || ''}
                    onChange={(e) => setNewCredential(prev => ({
                      ...prev,
                      values: { ...prev.values, [field]: e.target.value }
                    }))}
                  />
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCredential} disabled={!newCredential.name.trim()}>
                Add Credential
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          All credentials are encrypted and stored securely. They are only decrypted during automation execution and never exposed in logs.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{credentials.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Username/Password</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {credentials.filter(c => c.type === 'username_password').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {credentials.filter(c => c.type === 'api_key').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">OAuth Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {credentials.filter(c => c.type === 'oauth_token').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credentials List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Stored Credentials</h2>
        
        {credentials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">No credentials stored</h3>
                  <p className="text-sm text-muted-foreground">Add your first credential to get started</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Credential
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {credentials.map((credential) => (
              <Card key={credential.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(credential.type)}
                        <CardTitle className="text-base">{credential.name}</CardTitle>
                        <Badge variant="outline">
                          {getTypeInfo(credential.type).label}
                        </Badge>
                      </div>
                      <CardDescription>
                        Last updated {formatLastUpdated(credential.lastUpdated)}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCredential(credential.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(credential.encryptedValues).map(([field, value]) => {
                      const showKey = `${credential.id}-${field}`;
                      const isVisible = showValues[showKey];
                      
                      return (
                        <div key={field} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-sm text-muted-foreground">
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </Label>
                            <div className="font-mono text-sm">
                              {isVisible ? 'decrypted-value-here' : value}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowValue(credential.id, field)}
                          >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}