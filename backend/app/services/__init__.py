"""
SalinO-Crop — Domain Services Package

Services:
  SalinityMappingService  - topsoil EC from satellite features
  ForecastService         - 30/60/90-day root-zone EC
  CropRecommendationService - EC → ranked cultivar list
  AdvisoryService         - structured facts → LLM Bengali advisory
  LLMService              - provider-agnostic LLM gateway
  VoiceService            - Bengali TTS
  GroundValidationService - officer EC submission workflow
  SatelliteService        - satellite data acquisition
  WeatherService          - weather data
  TideService             - tide data
"""
