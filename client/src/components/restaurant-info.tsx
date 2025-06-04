import { useQuery } from "@tanstack/react-query";
import { restaurantApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, Phone, Globe, Star, Calendar, Navigation, Utensils } from "lucide-react";

export function RestaurantInfo() {
  const { data: restaurantInfo, isLoading, error } = useQuery({
    queryKey: ["/api/restaurant/info"],
    queryFn: () => restaurantApi.getInfo(),
  });

  if (isLoading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !restaurantInfo) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-1">Restaurant Info</h3>
          <p className="text-sm text-red-600">Failed to load restaurant information</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = restaurantInfo.hours[today] || "Hours not available";

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-1">Restaurant Info</h3>
        <p className="text-sm text-gray-600">Live information from Google Places</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Restaurant Header */}
        <div className="text-center pb-4 border-b border-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
            alt="Bodegoes Restaurant" 
            className="w-full h-32 object-cover rounded-xl mb-3"
          />
          <h4 className="font-bold text-xl text-gray-900">{restaurantInfo.name}</h4>
          <p className="text-gray-600">Mediterranean Cuisine</p>
          <div className="flex items-center justify-center mt-2">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < Math.floor(restaurantInfo.rating) ? "fill-current" : ""}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {restaurantInfo.rating} ({restaurantInfo.reviews} reviews)
            </span>
          </div>
        </div>

        {/* Hours Section */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-900 flex items-center">
            <Clock className="text-bodegoes mr-2" size={16} />
            Hours
          </h5>
          <div className="space-y-2 text-sm">
            {Object.entries(restaurantInfo.hours).map(([day, hours]) => (
              <div 
                key={day} 
                className={`flex justify-between ${day === today ? 'bg-green-50 px-2 py-1 rounded' : ''}`}
              >
                <span className={day === today ? 'text-green-700 font-medium' : 'text-gray-600'}>
                  {day === today ? 'Today' : day}
                </span>
                <span className={day === today ? 'font-medium text-green-800' : 'font-medium text-gray-900'}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-900 flex items-center">
            <MapPin className="text-bodegoes mr-2" size={16} />
            Location & Contact
          </h5>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
              <span className="text-gray-700">{restaurantInfo.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="text-gray-400 flex-shrink-0" size={14} />
              <a href={`tel:${restaurantInfo.phone}`} className="text-bodegoes hover:underline">
                {restaurantInfo.phone}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="text-gray-400 flex-shrink-0" size={14} />
              <a href={`https://${restaurantInfo.website}`} className="text-bodegoes hover:underline" target="_blank" rel="noopener noreferrer">
                {restaurantInfo.website}
              </a>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className={`border rounded-xl p-3 ${restaurantInfo.isOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${restaurantInfo.isOpen ? 'text-green-800' : 'text-red-800'}`}>
                {restaurantInfo.currentStatus}
              </p>
              <p className={`text-sm ${restaurantInfo.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {todayHours}
              </p>
            </div>
            <div className={restaurantInfo.isOpen ? 'text-green-600' : 'text-red-600'}>
              <Clock size={20} />
            </div>
          </div>
          <p className={`text-xs mt-1 ${restaurantInfo.isOpen ? 'text-green-600' : 'text-red-600'}`}>
            Updated live via Google Places
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-900">Quick Actions</h5>
          <div className="space-y-2">
            <Button className="w-full bg-bodegoes hover:bg-bodegoes-dark text-white">
              <Calendar className="mr-2" size={16} />
              Make Reservation
            </Button>
            <Button variant="outline" className="w-full">
              <Navigation className="mr-2" size={16} />
              Get Directions
            </Button>
            <Button variant="outline" className="w-full">
              <Utensils className="mr-2" size={16} />
              View Menu
            </Button>
          </div>
        </div>

        {/* Special Offers */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <Star className="text-orange-500 mr-2" size={16} />
            <h5 className="font-semibold text-orange-800">Today's Special</h5>
          </div>
          <p className="text-sm text-orange-700">
            Happy Hour: 3-6 PM<br />
            25% off appetizers & drinks!
          </p>
        </div>
      </div>
    </div>
  );
}
