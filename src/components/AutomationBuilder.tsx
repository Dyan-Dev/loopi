import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Globe, 
  Mouse, 
  Type, 
  Clock, 
  Camera, 
  Download,
  GripVertical,
  Shield,
  Monitor,
  Smartphone
} from 'lucide-react';
import type { Automation, AutomationStep, Credential } from '../app';

interface AutomationBuilderProps {
  automation: Automation | null;
  credentials: Credential[];
  onSave: (automation: Automation) => void;
  onCancel: () => void;
}

export function AutomationBuilder({ automation, credentials, onSave, onCancel }: AutomationBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [schedule, setSchedule] = useState({
    type: 'manual' as 'interval' | 'fixed' | 'manual',
    interval: 30,
    unit: 'minutes' as 'minutes' | 'hours' | 'days',
    value: '09:00'
  });
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description);
      setSteps(automation.steps);
      if (automation.schedule.type !== 'manual') {
        setSchedule({
          type: automation.schedule.type,
          interval: automation.schedule.interval || 30,
          unit: automation.schedule.unit || 'minutes',
          value: automation.schedule.value || '09:00'
        });
      }
    }
  }, [automation]);

  const stepTypes = [
    { value: 'navigate', label: 'Navigate', icon: Globe, description: 'Go to a URL' },
    { value: 'click', label: 'Click', icon: Mouse, description: 'Click an element' },
    { value: 'type', label: 'Type', icon: Type, description: 'Enter text' },
    { value: 'wait', label: 'Wait', icon: Clock, description: 'Wait for a duration' },
    { value: 'screenshot', label: 'Screenshot', icon: Camera, description: 'Take a screenshot' },
    { value: 'extract', label: 'Extract', icon: Download, description: 'Extract data' }
  ];

  const addStep = (type: AutomationStep['type']) => {
    const newStep: AutomationStep = {
      id: Date.now().toString(),
      type,
      description: `${stepTypes.find(s => s.value === type)?.label} step`,
      selector: type === 'navigate' ? '' : 'body',
      value: type === 'navigate' ? 'https://' : ''
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<AutomationStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const handleSave = () => {
    const automationData: Automation = {
      id: automation?.id || Date.now().toString(),
      name,
      description,
      status: 'idle',
      steps,
      schedule: schedule.type === 'manual' 
        ? { type: 'manual' }
        : schedule.type === 'fixed'
        ? { type: 'fixed', value: schedule.value }
        : { type: 'interval', interval: schedule.interval, unit: schedule.unit },
      linkedCredentials: steps
        .filter(step => step.credentialId)
        .map(step => step.credentialId!)
        .filter((id, index, arr) => arr.indexOf(id) === index), // Remove duplicates
      lastRun: automation?.lastRun
    };
    
    onSave(automationData);
  };

  const testAutomation = () => {
    setIsRecording(true);
    // Mock test execution
    setTimeout(() => {
      setIsRecording(false);
      alert('Test completed successfully!');
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {automation ? 'Edit Automation' : 'Create Automation'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Design and test your browser automation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={testAutomation} disabled={isRecording}>
              <Play className="h-4 w-4 mr-2" />
              {isRecording ? 'Testing...' : 'Test'}
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Browser Preview */}
        <div className="flex-1 flex flex-col bg-muted/30">
          <div className="border-b border-border bg-card p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>
              
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Enter URL to navigate to"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div 
              className={`mx-auto bg-white border border-border rounded-lg shadow-sm h-full ${
                viewMode === 'mobile' ? 'max-w-sm' : 'w-full'
              }`}
            >
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Globe className="h-12 w-12 mx-auto" />
                  <p>Browser Preview</p>
                  <p className="text-sm">Chromium-based automation preview would appear here</p>
                  {isRecording && (
                    <Badge variant="default" className="bg-red-100 text-red-800 border-red-300">
                      Recording...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Editor */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          <Tabs defaultValue="steps" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="steps" className="flex-1 overflow-hidden m-4 mt-4">
              <div className="h-full flex flex-col space-y-4">
                {/* Add Step Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {stepTypes.map((stepType) => (
                    <Button
                      key={stepType.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addStep(stepType.value as AutomationStep['type'])}
                      className="h-auto p-2 flex flex-col items-center gap-1"
                    >
                      <stepType.icon className="h-4 w-4" />
                      <span className="text-xs">{stepType.label}</span>
                    </Button>
                  ))}
                </div>

                <Separator />

                {/* Steps List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="space-y-2">
                        <Plus className="h-8 w-8 mx-auto" />
                        <p className="text-sm">No steps yet</p>
                        <p className="text-xs">Add steps to build your automation</p>
                      </div>
                    </div>
                  ) : (
                    steps.map((step, index) => {
                      const stepType = stepTypes.find(s => s.value === step.type);
                      return (
                        <Card key={step.id} className="relative">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                {stepType && <stepType.icon className="h-4 w-4" />}
                                <span className="text-sm font-medium">{stepType?.label}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStep(step.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Description</Label>
                              <Input
                                value={step.description}
                                onChange={(e) => updateStep(step.id, { description: e.target.value })}
                                className="text-xs"
                                placeholder="Step description"
                              />
                            </div>
                            
                            {step.type === 'navigate' && (
                              <div className="space-y-2">
                                <Label className="text-xs">URL</Label>
                                <Input
                                  value={step.value || ''}
                                  onChange={(e) => updateStep(step.id, { value: e.target.value })}
                                  placeholder="https://example.com"
                                  className="text-xs"
                                />
                              </div>
                            )}
                            
                            {(step.type === 'click' || step.type === 'type' || step.type === 'extract') && (
                              <div className="space-y-2">
                                <Label className="text-xs">CSS Selector</Label>
                                <Input
                                  value={step.selector || ''}
                                  onChange={(e) => updateStep(step.id, { selector: e.target.value })}
                                  placeholder="button, .class, #id"
                                  className="text-xs"
                                />
                              </div>
                            )}
                            
                            {step.type === 'type' && (
                              <div className="space-y-2">
                                <Label className="text-xs">Text to Type</Label>
                                <Input
                                  value={step.value || ''}
                                  onChange={(e) => updateStep(step.id, { value: e.target.value })}
                                  placeholder="Text to enter"
                                  className="text-xs"
                                />
                                
                                {credentials.length > 0 && (
                                  <div className="space-y-2">
                                    <Label className="text-xs">Or use credential</Label>
                                    <Select
                                      value={step.credentialId || ''}
                                      onValueChange={(value) => updateStep(step.id, { credentialId: value || undefined })}
                                    >
                                      <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Select credential" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {credentials.map(cred => (
                                          <SelectItem key={cred.id} value={cred.id}>
                                            <div className="flex items-center gap-2">
                                              <Shield className="h-3 w-3" />
                                              {cred.name}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {step.type === 'wait' && (
                              <div className="space-y-2">
                                <Label className="text-xs">Duration (seconds)</Label>
                                <Input
                                  type="number"
                                  value={step.value || '1'}
                                  onChange={(e) => updateStep(step.id, { value: e.target.value })}
                                  className="text-xs"
                                  min="1"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 overflow-y-auto m-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Automation Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter automation name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this automation does"
                    rows={3}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>Schedule</Label>
                  
                  <Select
                    value={schedule.type}
                    onValueChange={(value) => setSchedule(prev => ({ 
                      ...prev, 
                      type: value as typeof schedule.type 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual only</SelectItem>
                      <SelectItem value="interval">Repeat interval</SelectItem>
                      <SelectItem value="fixed">Fixed time</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {schedule.type === 'interval' && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={schedule.interval}
                        onChange={(e) => setSchedule(prev => ({ 
                          ...prev, 
                          interval: parseInt(e.target.value) || 1 
                        }))}
                        className="flex-1"
                        min="1"
                      />
                      <Select
                        value={schedule.unit}
                        onValueChange={(value) => setSchedule(prev => ({ 
                          ...prev, 
                          unit: value as typeof schedule.unit 
                        }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">min</SelectItem>
                          <SelectItem value="hours">hrs</SelectItem>
                          <SelectItem value="days">days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {schedule.type === 'fixed' && (
                    <Input
                      type="time"
                      value={schedule.value}
                      onChange={(e) => setSchedule(prev => ({ 
                        ...prev, 
                        value: e.target.value 
                      }))}
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}