'use client';

import { useState, useEffect } from 'react';
import { MCPServerConfig, MCPStdioConfig, MCPWebSocketConfig } from '@/shared/types/mcp/mcp';
import { MessageState } from '../../../types';

// Type guards
export const isStdioConfig = (config: MCPServerConfig): config is MCPStdioConfig => {
  return config.transport === 'stdio';
};

export const isWebSocketConfig = (config: MCPServerConfig): config is MCPWebSocketConfig => {
  return config.transport === 'websocket';
};

interface UseLocalServerStateProps {
  initialConfig?: MCPServerConfig | null;
}

export const useLocalServerState = ({ initialConfig }: UseLocalServerStateProps) => {
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    define: true,
    build: true,
    run: true
  });

  // Initialize with stdio transport by default
  const [localConfig, setLocalConfig] = useState<MCPServerConfig>({
    name: '',
    command: '',
    args: [],
    env: {},
    disabled: false,
    autoApprove: [],
    rootPath: '',
    transport: 'stdio',
    _buildCommand: '',
    _installCommand: ''
  } as MCPStdioConfig);
  
  // State for websocket URL (only used when transport is 'websocket')
  const [websocketUrl, setWebsocketUrl] = useState<string>('');
  
  const [buildCommand, setBuildCommand] = useState<string>('');
  const [installCommand, setInstallCommand] = useState<string>('');
  const [message, setMessage] = useState<MessageState | null>(null);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [buildCompleted, setBuildCompleted] = useState<boolean>(false);
  const [installCompleted, setInstallCompleted] = useState<boolean>(false);
  const [isParsingReadme, setIsParsingReadme] = useState<boolean>(false);
  const [isParsingEnv, setIsParsingEnv] = useState<boolean>(false);

  // State for console output
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [isConsoleVisible, setIsConsoleVisible] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runCompleted, setRunCompleted] = useState<boolean>(false);
  const [consoleTitle, setConsoleTitle] = useState<string>('Command Output');

  // Toggle section expansion
  const toggleSection = (section: 'define' | 'build' | 'run') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle transport type change
  const handleTransportChange = (transport: 'stdio' | 'websocket') => {
    if (transport === 'websocket') {
      // Convert to websocket config
      setLocalConfig(prev => ({
        name: prev.name,
        disabled: prev.disabled,
        autoApprove: prev.autoApprove,
        rootPath: prev.rootPath,
        env: prev.env,
        _buildCommand: prev._buildCommand,
        _installCommand: prev._installCommand,
        transport: 'websocket',
        websocketUrl: websocketUrl
      } as MCPWebSocketConfig));
    } else {
      // Convert to stdio config
      setLocalConfig(prev => ({
        name: prev.name,
        command: isStdioConfig(prev) ? prev.command : '',
        args: isStdioConfig(prev) ? prev.args : [],
        disabled: prev.disabled,
        autoApprove: prev.autoApprove,
        rootPath: prev.rootPath,
        env: prev.env,
        _buildCommand: prev._buildCommand,
        _installCommand: prev._installCommand,
        transport: 'stdio'
      } as MCPStdioConfig));
    }
  };

  // Handle argument changes
  const handleArgChange = (index: number, value: string) => {
    if (isStdioConfig(localConfig)) {
      setLocalConfig(prev => {
        if (isStdioConfig(prev) && prev.args) {
          return {
            ...prev,
            args: prev.args.map((arg, i) => i === index ? value : arg)
          };
        }
        return prev;
      });
    }
  };

  const addArgField = () => {
    if (isStdioConfig(localConfig)) {
      setLocalConfig(prev => {
        if (isStdioConfig(prev)) {
          const currentArgs = prev.args || [];
          return {
            ...prev,
            args: [...currentArgs, '']
          };
        }
        return prev;
      });
    }
  };

  const removeArgField = (index: number) => {
    if (isStdioConfig(localConfig)) {
      setLocalConfig(prev => {
        if (isStdioConfig(prev) && prev.args) {
          return {
            ...prev,
            args: prev.args.filter((_, i) => i !== index)
          };
        }
        return prev;
      });
    }
  };

  // Handle environment variable changes
  const handleEnvChange = (env: Record<string, string>) => {
    setLocalConfig(prev => {
      // Create a copy of the previous config with the updated env
      const updatedConfig = { ...prev, env };
      
      // Ensure we maintain the correct type
      if (isStdioConfig(prev)) {
        return updatedConfig as MCPStdioConfig;
      } else if (isWebSocketConfig(prev)) {
        return updatedConfig as MCPWebSocketConfig;
      }
      
      return prev;
    });
  };

  // Initialize state from initialConfig
  useEffect(() => {
    if (initialConfig) {
      // Extract rootPath if it exists
      const rootPath = initialConfig.rootPath || '';
            
      // Create a new config with the extracted rootPath
      const configWithRootPath = {
        ...initialConfig,
        rootPath
      };
      
      setLocalConfig(configWithRootPath);
      
      // Set build and install commands from config if available
      if (initialConfig._buildCommand) {
        setBuildCommand(initialConfig._buildCommand);
      }
      if (initialConfig._installCommand) {
        setInstallCommand(initialConfig._installCommand);
      }
      
      // Set websocketUrl if the transport is 'websocket'
      if (initialConfig.transport === 'websocket') {
        setWebsocketUrl((initialConfig as MCPWebSocketConfig).websocketUrl || '');
      }
    }
  }, [initialConfig]);

  return {
    // State
    localConfig,
    setLocalConfig,
    websocketUrl,
    setWebsocketUrl,
    buildCommand,
    setBuildCommand,
    installCommand,
    setInstallCommand,
    message,
    setMessage,
    isBuilding,
    setIsBuilding,
    isInstalling,
    setIsInstalling,
    buildCompleted,
    setBuildCompleted,
    installCompleted,
    setInstallCompleted,
    isParsingReadme,
    setIsParsingReadme,
    isParsingEnv,
    setIsParsingEnv,
    consoleOutput,
    setConsoleOutput,
    isConsoleVisible,
    setIsConsoleVisible,
    isRunning,
    setIsRunning,
    runCompleted,
    setRunCompleted,
    consoleTitle,
    setConsoleTitle,
    expandedSections,
    
    // Methods
    toggleSection,
    handleTransportChange,
    handleArgChange,
    addArgField,
    removeArgField,
    handleEnvChange
  };
};
