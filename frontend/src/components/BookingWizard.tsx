import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url?: string;
}

interface DaySlots {
  date: string;
  slots: string[];
}

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data stores
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [availability, setAvailability] = useState<DaySlots[]>([]);

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Customer contact form
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [bookingResult, setBookingResult] = useState<any>(null);

  const API_BASE = "http://localhost:8000/api/v1";

  // Load initial data: Categories and Services
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const [catsRes, servsRes] = await Promise.all([
          fetch(`${API_BASE}/categories`).then(r => r.json()),
          fetch(`${API_BASE}/services`).then(r => r.json()),
        ]);
        setCategories(catsRes);
        setServices(servsRes);
        
        // If query param lists specific service, set it
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedServiceId = urlParams.get("service");
        if (preselectedServiceId && servsRes.length) {
          const found = servsRes.find((s: Service) => s.id === preselectedServiceId);
          if (found) {
            setSelectedService(found);
            setSelectedCategory(found.category_id);
            setStep(2); // Go to staff selection
          }
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
        setError("Failed to connect to catalog database. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch staff when moving to Step 2
  useEffect(() => {
    if (step === 2 && staffList.length === 0) {
      async function loadStaff() {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/staff`).then(r => r.json());
          setStaffList(res);
        } catch (err) {
          setError("Failed to load staff list.");
        } finally {
          setLoading(false);
        }
      }
      loadStaff();
    }
  }, [step]);

  // Fetch availability when date parameters are reached
  useEffect(() => {
    if (step === 3 && selectedService) {
      async function loadAvailability() {
        setLoading(true);
        setError(null);
        try {
          const today = new Date();
          const startDate = today.toISOString().split("T")[0];
          
          // Check next 14 days
          const futureDate = new Date();
          futureDate.setDate(today.getDate() + 14);
          const endDate = futureDate.toISOString().split("T")[0];

          let url = `${API_BASE}/availability?service_id=${selectedService.id}&start_date=${startDate}&end_date=${endDate}`;
          if (selectedStaff !== "any") {
            url += `&staff_id=${selectedStaff}`;
          }

          const res = await fetch(url).then(r => r.json());
          setAvailability(res);
        } catch (err) {
          setError("Failed to load availability slots.");
        } finally {
          setLoading(false);
        }
      }
      loadAvailability();
    }
  }, [step, selectedStaff, selectedService]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setError(null);
    setStep(2);
  };

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId);
    setStep(3);
  };

  const handleSlotSelect = (dateStr: string, slotStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(slotStr);
    setStep(4);
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !selectedDate) return;

    setLoading(true);
    setError(null);

    const [hour, minute] = selectedSlot.split(":");
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(parseInt(hour), parseInt(minute), 0);

    const payload = {
      service_id: selectedService.id,
      staff_id: selectedStaff === "any" ? staffList[0]?.id : selectedStaff,
      start_time: bookingDateTime.toISOString(),
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
      },
    };

    try {
      const res = await fetch(`${API_BASE}/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || "Booking failed.");
      }

      const booking = await res.json();
      setBookingResult(booking);
      setStep(5); // Success step
    } catch (err: any) {
      setError(err.message || "Something went wrong during reservation. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeServices = selectedCategory
    ? services.filter(s => s.category_id === selectedCategory)
    : services;

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative text-brand-charcoal">
      
      {/* Left 2 columns: Booking Flow Wizard Card */}
      <div className="lg:col-span-2 bg-white border border-brand-border p-6 sm:p-8 rounded-2xl shadow-sm relative flex flex-col justify-between min-h-[500px]">
        <div>
          {/* Steps Indicator */}
          <div className="flex items-center justify-between border-b border-brand-border pb-6 mb-8 text-[11px] sm:text-xs tracking-wider uppercase font-bold text-zinc-400">
            <span className={step === 1 ? "text-brand-pink" : ""}>1. Service</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 2 ? "text-brand-pink" : ""}>2. Stylist</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 3 ? "text-brand-pink" : ""}>3. Slot</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 4 ? "text-brand-pink" : ""}>4. Client</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 5 ? "text-brand-pink" : ""}>5. Done</span>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30">
              <div className="flex flex-col items-center space-y-4">
                <span className="animate-spin text-brand-pink text-3xl">⏳</span>
                <span className="text-brand-pink font-bold tracking-widest text-sm uppercase">Securing data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: SERVICE CHOICE */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">Select your Service</h2>
              
              {/* Categories filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                    selectedCategory === ""
                      ? "bg-brand-pink text-white"
                      : "border border-brand-border hover:bg-brand-light-pink text-brand-charcoal"
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-brand-pink text-white"
                        : "border border-brand-border hover:bg-brand-light-pink text-brand-charcoal"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 max-h-[400px] overflow-y-auto pr-1">
                {activeServices.map(service => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="bg-white border border-brand-border p-5 rounded-xl flex justify-between items-center cursor-pointer transition-all hover:border-brand-pink/30 hover:shadow-sm hover:translate-y-[-2px]"
                  >
                    <div className="space-y-1 pr-6">
                      <h3 className="font-heading font-bold text-base text-brand-charcoal">{service.name}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                      <span className="text-xs text-brand-pink font-semibold block pt-1">⏱️ {service.duration_minutes} mins</span>
                    </div>
                    <div className="text-right">
                      <span className="text-brand-pink font-bold text-lg tracking-wider block">
                        ${(service.price_cents / 100).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold mt-1">
                        Select
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: STYLIST CHOICE */}
          {step === 2 && selectedService && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">Choose your Stylist</h2>
                <button onClick={() => setStep(1)} className="text-xs text-brand-pink hover:underline font-bold">&larr; Back</button>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2">
                {/* Any specialist option */}
                <div
                  onClick={() => handleStaffSelect("any")}
                  className="bg-white border border-brand-border p-5 rounded-xl flex items-center cursor-pointer transition-all hover:border-brand-pink/30 hover:shadow-sm hover:translate-y-[-2px]"
                >
                  <div className="w-12 h-12 bg-brand-pink/10 rounded-full flex items-center justify-center text-lg mr-4 border border-brand-pink/20">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-charcoal text-base">Any Available Specialist</h3>
                    <p className="text-xs text-zinc-500">Select to get the quickest appointment slot</p>
                  </div>
                </div>

                {/* Custom staff members */}
                {staffList.map(staff => (
                  <div
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff.id)}
                    className="bg-white border border-brand-border p-5 rounded-xl flex items-center cursor-pointer transition-all hover:border-brand-pink/30 hover:shadow-sm hover:translate-y-[-2px]"
                  >
                    <div className="w-12 h-12 bg-brand-pink/10 rounded-full flex items-center justify-center text-sm mr-4 border border-brand-pink/20 text-brand-pink font-bold uppercase overflow-hidden">
                      {staff.first_name[0]}{staff.last_name ? staff.last_name[0] : ""}
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-charcoal text-base">{staff.first_name} {staff.last_name || ""}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-1">{staff.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SLOT CHOICE */}
          {step === 3 && selectedService && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">Select Date & Time</h2>
                <button onClick={() => setStep(2)} className="text-xs text-brand-pink hover:underline font-bold">&larr; Back</button>
              </div>

              {availability.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  No slots available for the next 14 days. Try selecting another specialist.
                </div>
              ) : (
                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
                  {availability.map(day => (
                    <div key={day.date} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-pink border-b border-brand-border pb-1">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {day.slots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => handleSlotSelect(day.date, slot)}
                            className="border border-brand-pink/15 bg-brand-pink/5 text-brand-charcoal hover:bg-brand-pink hover:text-white text-xs font-semibold py-2 rounded transition-colors text-center"
                          >
                            {slot.split(":").slice(0, 2).join(":")}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CLIENT DETAILS */}
          {step === 4 && selectedService && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">Contact Details</h2>
                <button onClick={() => setStep(3)} className="text-xs text-brand-pink hover:underline font-bold">&larr; Back</button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">First Name</label>
                    <input
                      type="text"
                      required
                      value={customer.first_name}
                      onChange={e => setCustomer({ ...customer, first_name: e.target.value })}
                      className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Last Name</label>
                    <input
                      type="text"
                      required
                      value={customer.last_name}
                      onChange={e => setCustomer({ ...customer, last_name: e.target.value })}
                      className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+13055550199"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold uppercase tracking-wider py-4 rounded transition-colors text-sm shadow-lg shadow-brand-pink/20 mt-6"
                >
                  Confirm Appointment
                </button>
              </form>
            </div>
          )}

          {/* STEP 5: SUCCESS BOOKED */}
          {step === 5 && bookingResult && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-3xl text-brand-pink font-bold tracking-wide">Appointment Secured!</h2>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  Thank you! Your appointment has been registered. A confirmation email has been sent.
                </p>
              </div>

              <div className="bg-brand-light-pink p-6 rounded-xl border border-brand-pink/10 max-w-sm mx-auto space-y-3 text-sm">
                <div className="flex justify-between border-b border-brand-pink/5 pb-2">
                  <span className="text-zinc-500">Booking Reference:</span>
                  <span className="font-mono text-brand-pink font-bold">{bookingResult.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between border-b border-brand-pink/5 pb-2">
                  <span className="text-zinc-500">Service:</span>
                  <span className="text-brand-charcoal font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-zinc-500">Appointment Time:</span>
                  <span className="text-brand-charcoal font-semibold">
                    {new Date(bookingResult.start_time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })} at {new Date(bookingResult.start_time).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              <a href="/" className="inline-block bg-brand-charcoal hover:bg-brand-pink text-white font-bold uppercase tracking-wider text-xs px-8 py-3.5 rounded transition-all shadow-md">
                Return Home
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Persistent Booking Summary Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-brand-light-pink border border-brand-pink/15 p-6 rounded-2xl shadow-sm space-y-6 sticky top-28">
          <h3 className="font-heading text-lg font-bold text-brand-charcoal border-b border-brand-pink/10 pb-3 uppercase tracking-wide">
            Your Booking Summary
          </h3>
          
          {selectedService ? (
            <div className="space-y-4 text-sm text-zinc-600">
              {/* Selected Service Row */}
              <div className="border-b border-brand-pink/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">Service</span>
                <span className="font-bold text-brand-charcoal block text-base mt-1 leading-tight">{selectedService.name}</span>
                <span className="text-xs text-zinc-400 block mt-0.5">⏱️ {selectedService.duration_minutes} mins</span>
              </div>
              
              {/* Specialist Row */}
              <div className="border-b border-brand-pink/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">Specialist</span>
                <span className="font-semibold text-brand-charcoal block mt-1">
                  {selectedStaff === "any" ? "Any Available Specialist" : staffList.find(s => s.id === selectedStaff)?.first_name || "Specialist Selected"}
                </span>
              </div>
              
              {/* Date & Time Row */}
              {selectedDate && selectedSlot && (
                <div className="border-b border-brand-pink/5 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">Date & Time</span>
                  <span className="font-semibold text-brand-charcoal block mt-1">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric"
                    })} at {selectedSlot.split(":").slice(0, 2).join(":")}
                  </span>
                </div>
              )}

              {/* Location Row */}
              <div className="border-b border-brand-pink/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">Location</span>
                <span className="text-xs block mt-1">📍 8700 SW 137th Ave, Miami, FL</span>
              </div>

              {/* Total Price Box */}
              <div className="pt-2 flex justify-between items-baseline">
                <span className="font-bold text-brand-charcoal">Total Price:</span>
                <span className="text-brand-pink font-extrabold text-2xl">
                  ${(selectedService.price_cents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs italic">
              Please select a beauty service to begin summarizing your booking details.
            </div>
          )}
          
          {/* Trust badges */}
          <div className="border-t border-brand-pink/10 pt-4 space-y-2.5 text-xs text-zinc-500">
            <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Free Parking Available</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Certified Aestheticians</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Clean & Sterilized Environment</p>
          </div>
        </div>
      </div>

    </div>
  );
}

