import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import SearchFiltersComponent, { type SearchFilters } from "@/components/search/search-filters";
import ProviderMap from "@/components/providers/provider-map";
import ProviderCard from "@/components/providers/provider-card";
import { authService } from "@/lib/auth";
import { useGeolocation } from "@/hooks/use-geolocation";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { latitude, longitude, error: geoError } = useGeolocation();
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null);

  const user = authService.getCurrentUser();
  const profile = authService.getCurrentProfile();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }
  }, [user, setLocation]);

  // Fetch providers based on search or location
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ["/api/providers/search", searchFilters, latitude, longitude],
    enabled: !!latitude && !!longitude,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchFilters) {
        if (searchFilters.serviceType) params.append("serviceType", searchFilters.serviceType);
        if (searchFilters.location) params.append("location", searchFilters.location);
        if (searchFilters.availableToday) params.append("isAvailable", "true");
      }
      
      if (latitude && longitude) {
        params.append("latitude", latitude.toString());
        params.append("longitude", longitude.toString());
        params.append("maxDistance", "50");
      }

      const response = await fetch(`/api/providers/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch providers");
      return response.json();
    },
  });

  // Fetch weather data
  const { data: weather } = useQuery({
    queryKey: ["/api/weather"],
    queryFn: async () => {
      const response = await fetch("/api/weather");
      if (!response.ok) throw new Error("Failed to fetch weather");
      return response.json();
    },
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await fetch(`/api/notifications/${user!.id}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  // Mock stats for demo
  const stats = {
    availableOperators: providers.length || 12,
    upcomingBookings: 3,
    weatherCondition: weather?.condition || "Ideal",
    coverageArea: "25km",
  };

  // Mock recent activities
  const activities = [
    {
      id: 1,
      title: "Serviço agendado com Carlos Santos",
      description: "Pulverização - Fazenda Santa Maria, 15 hectares",
      date: "Há 2 horas",
      type: "booking" as const,
      status: "Confirmado",
    },
    {
      id: 2,
      title: "Avaliação enviada",
      description: "Você avaliou o serviço de Ana Oliveira",
      date: "Ontem",
      type: "review" as const,
      rating: 5,
    },
    {
      id: 3,
      title: "Alerta meteorológico",
      description: "Chuva prevista para quinta-feira - reagende se necessário",
      date: "Há 1 dia",
      type: "weather" as const,
      status: "Atenção",
    },
  ];

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleProviderClick = (provider: any) => {
    setLocation(`/provider/${provider.id}`);
  };

  const handleBooking = (providerId: number) => {
    setLocation(`/booking/${providerId}`);
  };

  useEffect(() => {
    if (geoError) {
      toast({
        title: "Erro de Localização",
        description: geoError,
        variant: "destructive",
      });
    }
  }, [geoError, toast]);

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-rural-dark mb-2">
            Bem-vindo, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-rural-gray">
            {user.userType === "producer" 
              ? "Encontre os melhores prestadores de serviços para sua propriedade rural."
              : "Gerencie seus serviços e encontre novos clientes."
            }
          </p>
        </div>

        {/* Quick Stats */}
        <StatsCards stats={stats} />

        {/* Search and Filter Section */}
        <div className="mb-8">
          <SearchFiltersComponent onSearch={handleSearch} loading={providersLoading} />
        </div>

        {/* Results Section with Map and List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Map View */}
          <ProviderMap 
            providers={providers} 
            onProviderClick={handleProviderClick}
          />

          {/* Service Providers List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-rural-dark">
              Prestadores Recomendados
            </h3>

            {providersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : providers.length > 0 ? (
              providers.slice(0, 3).map((provider: any) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onBooking={handleBooking}
                />
              ))
            ) : (
              <div className="text-center py-8 text-rural-gray">
                <p>Nenhum prestador encontrado na sua região.</p>
                <p className="text-sm">Tente expandir o raio de busca ou alterar os filtros.</p>
              </div>
            )}

            {providers.length > 3 && (
              <Button 
                variant="outline" 
                className="w-full border-2 border-dashed border-gray-300 text-rural-gray hover:border-rural-green hover:text-rural-green"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ver Mais Prestadores
              </Button>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <RecentActivity activities={activities} />
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Quick Action FAB */}
      <Button 
        className="fixed bottom-20 md:bottom-8 right-4 bg-rural-green hover:bg-green-600 w-14 h-14 rounded-full shadow-lg"
        size="icon"
        onClick={() => setLocation("/search")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
