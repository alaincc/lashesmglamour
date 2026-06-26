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
    <div class="w-full max-w-2xl mx-auto glass-card rounded-lg p-6 sm:p-8 shadow-2xl relative">
      {/* Steps Indicator */}
      <div class="flex items-center justify-between border-b border-brand-gold/10 pb-6 mb-8 text-xs tracking-wider uppercase font-bold text-brand-grey-muted">
        <span class={step === 1 ? "text-brand-gold" : ""}>1. Service</span>
        <span class="text-brand-gold/30">&rarr;</span>
        <span class={step === 2 ? "text-brand-gold" : ""}>2. Stylist</span>
        <span class="text-brand-gold/30">&rarr;</span>
        <span class={step === 3 ? "text-brand-gold" : ""}>3. Slot</span>
        <span class="text-brand-gold/30">&rarr;</span>
        <span class={step === 4 ? "text-brand-gold" : ""}>4. Client</span>
        <span class="text-brand-gold/30">&rarr;</span>
        <span class={step === 5 ? "text-brand-gold" : ""}>5. Done</span>
      </div>

      {loading && (
        <div class="absolute inset-0 bg-brand-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-30">
          <div class="flex flex-col items-center space-y-4">
            <span class="animate-spin text-brand-gold text-3xl">⏳</span>
            <span class="text-brand-gold font-bold tracking-widest text-sm uppercase">Securing data...</span>
          </div>
        </div>
      )}

      {error && (
        <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-md mb-6 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* STEP 1: SERVICE CHOICE */}
      {step === 1 && (
        <div class="space-y-6">
          <h2 class="font-heading text-2xl text-brand-gold tracking-wide">Select your Service</h2>
          
          {/* Categories filter */}
          <div class="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              class={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedCategory === ""
                  ? "bg-brand-gold text-brand-black"
                  : "border border-brand-gold/20 hover:bg-brand-gold/10"
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                class={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-brand-gold text-brand-black"
                    : "border border-brand-gold/20 hover:bg-brand-gold/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div class="grid grid-cols-1 gap-4 pt-4">
            {activeServices.map(service => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                class="glass-card p-5 rounded-md flex justify-between items-center cursor-pointer transition-all hover:border-brand-gold/30 hover:translate-y-[-2px]"
              >
                <div class="space-y-1 pr-6">
                  <h3 class="font-heading text-lg text-brand-ivory">{service.name}</h3>
                  <p class="text-xs text-brand-grey-muted leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  <span class="text-xs text-brand-gold/80 block pt-1">⏱️ {service.duration_minutes} mins</span>
                </div>
                <div class="text-right">
                  <span class="text-brand-gold font-bold text-lg tracking-wider block">
                    ${(service.price_cents / 100).toFixed(2)}
                  </span>
                  <span class="text-[10px] text-brand-grey-muted uppercase tracking-widest block font-bold mt-1">
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
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="font-heading text-2xl text-brand-gold tracking-wide">Choose your Stylist</h2>
            <button onClick={() => setStep(1)} class="text-xs text-brand-gold hover:underline">&larr; Back</button>
          </div>

          <div class="grid grid-cols-1 gap-4 pt-4">
            {/* Any specialist option */}
            <div
              onClick={() => handleStaffSelect("any")}
              class="glass-card p-5 rounded-md flex items-center cursor-pointer transition-all hover:border-brand-gold/30 hover:translate-y-[-2px]"
            >
              <div class="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-lg mr-4 border border-brand-gold/10">
                ✨
              </div>
              <div>
                <h3 class="font-semibold text-brand-ivory">Any Available Specialist</h3>
                <p class="text-xs text-brand-grey-muted">Select to get the quickest appointment slot</p>
              </div>
            </div>

            {/* Custom staff members */}
            {staffList.map(staff => (
              <div
                key={staff.id}
                onClick={() => handleStaffSelect(staff.id)}
                class="glass-card p-5 rounded-md flex items-center cursor-pointer transition-all hover:border-brand-gold/30 hover:translate-y-[-2px]"
              >
                <div class="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-lg mr-4 border border-brand-gold/20 text-brand-gold font-bold uppercase overflow-hidden">
                  {staff.first_name[0]}{staff.last_name ? staff.last_name[0] : ""}
                </div>
                <div>
                  <h3 class="font-semibold text-brand-ivory">{staff.first_name} {staff.last_name || ""}</h3>
                  <p class="text-xs text-brand-grey-muted leading-relaxed line-clamp-1">{staff.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SLOT CHOICE */}
      {step === 3 && selectedService && (
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="font-heading text-2xl text-brand-gold tracking-wide">Select Date & Time</h2>
            <button onClick={() => setStep(2)} class="text-xs text-brand-gold hover:underline">&larr; Back</button>
          </div>

          {availability.length === 0 ? (
            <div class="text-center py-8 text-brand-grey-muted text-sm">
              No slots available for the next 14 days. Try selecting another specialist.
            </div>
          ) : (
            <div class="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {availability.map(day => (
                <div key={day.date} class="space-y-3">
                  <h3 class="text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-gold/5 pb-1">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {day.slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => handleSlotSelect(day.date, slot)}
                        class="border border-brand-gold/10 bg-brand-gold/5 text-brand-ivory hover:bg-brand-gold hover:text-brand-black text-xs font-semibold py-2 rounded transition-colors text-center"
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
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="font-heading text-2xl text-brand-gold tracking-wide">Contact Details</h2>
            <button onClick={() => setStep(3)} class="text-xs text-brand-gold hover:underline">&larr; Back</button>
          </div>

          <form onSubmit={handleCustomerSubmit} class="space-y-4 pt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-brand-grey-muted">First Name</label>
                <input
                  type="text"
                  required
                  value={customer.first_name}
                  onChange={e => setCustomer({ ...customer, first_name: e.target.value })}
                  class="w-full bg-brand-black border border-brand-gold/20 rounded p-3 text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-brand-grey-muted">Last Name</label>
                <input
                  type="text"
                  required
                  value={customer.last_name}
                  onChange={e => setCustomer({ ...customer, last_name: e.target.value })}
                  class="w-full bg-brand-black border border-brand-gold/20 rounded p-3 text-sm focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-brand-grey-muted">Email Address</label>
              <input
                type="email"
                required
                value={customer.email}
                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                class="w-full bg-brand-black border border-brand-gold/20 rounded p-3 text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-widest text-brand-grey-muted">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+13055550199"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                class="w-full bg-brand-black border border-brand-gold/20 rounded p-3 text-sm focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div class="bg-brand-gold/5 p-4 rounded-md border border-brand-gold/10 space-y-2 text-xs leading-relaxed text-brand-grey-muted">
              <span class="font-bold text-brand-gold block">SUMMARY OF SELECTION</span>
              <p>💆 {selectedService.name} (${(selectedService.price_cents / 100).toFixed(2)})</p>
              <p>📅 {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
              })} at {selectedSlot.split(":").slice(0, 2).join(":")}</p>
            </div>

            <button
              type="submit"
              class="w-full bg-brand-gold hover:bg-brand-champagne text-brand-black font-bold uppercase tracking-wider py-4 rounded-brand transition-colors text-sm shadow-gold mt-6"
            >
              Confirm Appointment
            </button>
          </form>
        </div>
      )}

      {/* STEP 5: SUCCESS BOOKED */}
      {step === 5 && bookingResult && (
        <div class="text-center py-8 space-y-6">
          <div class="w-16 h-16 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full flex items-center justify-center text-3xl mx-auto">
            ✓
          </div>
          <div class="space-y-2">
            <h2 class="font-heading text-3xl text-brand-gold tracking-wide">Appointment Secured!</h2>
            <p class="text-sm text-brand-grey-muted max-w-md mx-auto">
              Thank you! Your appointment has been registered. A confirmation email has been sent.
            </p>
          </div>

          <div class="bg-brand-grey-dark p-6 rounded-md border border-brand-gold/5 max-w-sm mx-auto space-y-3 text-sm">
            <div class="flex justify-between border-b border-brand-gold/5 pb-2">
              <span class="text-brand-grey-muted">Booking Reference:</span>
              <span class="font-mono text-brand-gold font-bold">{bookingResult.id.slice(-8).toUpperCase()}</span>
            </div>
            <div class="flex justify-between border-b border-brand-gold/5 pb-2">
              <span class="text-brand-grey-muted">Service:</span>
              <span class="text-brand-ivory font-semibold">{selectedService?.name}</span>
            </div>
            <div class="flex justify-between pb-2">
              <span class="text-brand-grey-muted">Appointment Time:</span>
              <span class="text-brand-ivory font-semibold">
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

          <a href="/" class="inline-block bg-brand-gold hover:bg-brand-champagne text-brand-black font-bold uppercase tracking-wider text-xs px-8 py-3 rounded-brand transition-colors">
            Return Home
          </a>
        </div>
      )}
    </div>
  );
}
