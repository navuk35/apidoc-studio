import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, FileText, Upload, Play, Eye } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  feature: string;
}

const tutorialSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to API Doc Viewer",
    description: "A powerful tool for viewing, editing, and testing OpenAPI specifications. Let's get you started with a quick tour.",
    icon: <FileText className="w-8 h-8" />,
    feature: "overview"
  },
  {
    id: 2, 
    title: "Upload Your API Spec",
    description: "Start by uploading your OpenAPI/Swagger YAML or JSON file. You can also paste your spec content directly.",
    icon: <Upload className="w-8 h-8" />,
    feature: "upload"
  },
  {
    id: 3,
    title: "Edit Your Spec",
    description: "Use the built-in YAML editor with syntax highlighting to modify your API specification in real-time.",
    icon: <FileText className="w-8 h-8" />,
    feature: "editor"
  },
  {
    id: 4,
    title: "Interactive Documentation",
    description: "View your API documentation with an interactive interface. Navigate through endpoints and see detailed information.",
    icon: <Eye className="w-8 h-8" />,
    feature: "docs"
  },
  {
    id: 5,
    title: "Test Your API",
    description: "Try out your API endpoints directly from the interface. Send requests and view responses in real-time.",
    icon: <Play className="w-8 h-8" />,
    feature: "test"
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete(), 300);
  };

  const handleSkipTutorial = () => {
    setIsVisible(false);
    setTimeout(() => onSkip(), 300);
  };

  const currentStepData = tutorialSteps[currentStep];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 h-8 w-8 p-0"
              onClick={handleSkipTutorial}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              {currentStepData.description}
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex gap-1 mt-6">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkipTutorial}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="flex items-center gap-2">
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};