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

const format12Hour = (timeStr: string) => {
  if (!timeStr) return "";
  const [hourStr, minStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minStr} ${ampm}`;
};

const serviceTranslations: Record<string, { name: string; description: string }> = {
  "classic lash extensions full set": {
    name: "Set Completo Clásico",
    description: "Una extensión premium de seda aplicada a cada pestaña natural. Aspecto extremadamente natural."
  },
  "classic full set": {
    name: "Set Completo Clásico",
    description: "Una extensión premium de seda aplicada a cada pestaña natural. Aspecto extremadamente natural."
  },
  "classic full set ( look natural )": {
    name: "Set Completo Clásico (Aspecto Natural)",
    description: "Una extensión premium de seda aplicada a cada pestaña natural. Aspecto extremadamente natural."
  },
  "classic full set (look natural)": {
    name: "Set Completo Clásico (Aspecto Natural)",
    description: "Una extensión premium de seda aplicada a cada pestaña natural. Aspecto extremadamente natural."
  },
  "hybrid lash extensions full set": {
    name: "Set Completo Híbrido",
    description: "Mezcla de extensiones clásicas y de volumen. Aspecto texturizado y más denso."
  },
  "hybrid full set": {
    name: "Set Completo Híbrido",
    description: "Mezcla de extensiones clásicas y de volumen. Aspecto texturizado y más denso."
  },
  "volume lash extensions full set": {
    name: "Set Completo de Volumen",
    description: "Abanicos ligeros aplicados a cada pestaña natural. Set de glamour esponjoso y denso."
  },
  "volume full set": {
    name: "Set Completo de Volumen",
    description: "Abanicos ligeros aplicados a cada pestaña natural. Set de glamour esponjoso y denso."
  },
  "volumen full set": {
    name: "Set Completo de Volumen",
    description: "Abanicos ligeros aplicados a cada pestaña natural. Set de glamour esponjoso y denso."
  },
  "volumen full set refill": {
    name: "Retoque de Set Completo de Volumen",
    description: "Retoque de abanicos ligeros aplicados a cada pestaña natural para rellenar los espacios y mantener el volumen."
  },
  "classic (look natural) refill": {
    name: "Retoque Clásico (Aspecto Natural)",
    description: "Retoque de una sola extensión premium aplicada a cada pestaña natural para mantener un aspecto fresco."
  },
  "hybrid refill": {
    name: "Retoque Híbrido",
    description: "Retoque de la mezcla de extensiones clásicas y de volumen para restaurar la plenitud y la definición."
  },
  "brow lamination & shaping": {
    name: "Laminación y Diseño de Cejas",
    description: "Relaja y da forma a los vellos de las cejas para un aspecto simétrico, cepillado y más denso."
  },
  "luxe rejuvenating facial": {
    name: "Facial Rejuvenecedor Luxe",
    description: "Tratamiento de hidratación profunda utilizando sueros de ácido hialurónico premium."
  },
  "brow wax & threading": {
    name: "Depilación de Cejas con Cera e Hilo",
    description: "Eliminación precisa del vello para una definición limpia y elegante."
  },
  "full legs waxing set": {
    name: "Set de Depilación de Piernas Completas",
    description: "Cera orgánica de grado médico aplicada para obtener piernas suaves y lisas."
  },
  "signature facial": {
    name: "Facial de la Firma",
    description: "Limpieza facial profunda personalizada con exfoliación y mascarilla nutritiva."
  },
  "premium facial": {
    name: "Facial Premium",
    description: "Tratamiento avanzado de rejuvenecimiento cutáneo con mascarilla de colágeno e hidratación profunda."
  },
  "skin spa deluxe facial": {
    name: "Facial Deluxe Skin Spa",
    description: "Experiencia facial de lujo que incluye peeling ultrasónico, microdermoabrasión y masaje relajante."
  },
  "facial - 1  seccion": {
    name: "Facial - 1 Sesión",
    description: "Una sesión de tratamiento facial especializado adaptado a las necesidades de tu tipo de piel."
  },
  "facial - 1 seccion": {
    name: "Facial - 1 Sesión",
    description: "Una sesión de tratamiento facial especializado adaptado a las necesidades de tu tipo de piel."
  },
  "facial - 6 seccions": {
    name: "Paquete Facial - 6 Sesiones",
    description: "Paquete completo de 6 sesiones de tratamiento facial para resultados duraderos y regeneración profunda."
  },
  "acne treatment - 1 session": {
    name: "Tratamiento de Acné - 1 Sesión",
    description: "Sesión de limpieza clínica facial especializada para reducir la inflamación y controlar el acné activo."
  },
  "acne treatment - 3 sessions": {
    name: "Paquete de Acné - 3 Sesiones",
    description: "Tratamiento de 3 sesiones diseñado para descongestionar poros y prevenir futuros brotes."
  },
  "acne treatment - 6 sessions": {
    name: "Paquete de Acné - 6 Sesiones",
    description: "Tratamiento completo e intensivo de 6 sesiones para control total del acné y renovación cutánea."
  }
};

const translateBio = (bio: string, isEs: boolean) => {
  if (!isEs) return bio;
  const bioLower = bio.toLowerCase().trim();
  if (bioLower.includes("professional therapist at lashes & mglamour")) {
    return "Terapeuta profesional en Lashes & MGlamour.";
  }
  return bio;
};

export default function BookingWizard({ lang = "en" }: { lang?: "en" | "es" }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Localization Dictionary
  const dictionary = {
    en: {
      securing: "Securing data...",
      stepService: "1. Service",
      stepStylist: "2. Stylist",
      stepSlot: "3. Slot",
      stepClient: "4. Client",
      stepDone: "5. Done",
      categoryAll: "All Menu",
      selectServiceTitle: "Select your Service",
      selectServiceSub: "Select a luxury service matching your style preferences to proceed.",
      backBtn: "← Back",
      chooseStylistTitle: "Choose your Stylist",
      chooseStylistSub: "Select a specific aesthetic technician or choose any available specialist.",
      anySpecialist: "Any Available Specialist",
      anySpecialistBio: "Select to get the quickest appointment slot",
      selectSlotTitle: "Select Date & Time",
      noSlots: "No slots available for the next 14 days. Try selecting another specialist.",
      loadingSlots: "Loading availability slots...",
      clientDetailsTitle: "Contact Details",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      submitBooking: "Confirm Appointment",
      summaryTitle: "Your Booking Summary",
      summaryService: "Service",
      summaryDuration: "Duration",
      summaryPrice: "Total Price",
      summarySpecialist: "Specialist",
      summaryDate: "Date & Time",
      summaryLocation: "Location",
      summaryPlaceholder: "Please select a beauty service to begin summarizing your booking details.",
      bookedTitle: "Appointment Secured!",
      bookedSub: "Thank you! Your appointment has been registered. A confirmation email has been sent.",
      bookedRef: "Booking Reference",
      bookedStatus: "Status",
      bookedInfo: "Our studio team will contact you if any schedule adjustment is required.",
      mins: "mins",
      freeText: "Free",
      returnHome: "Return Home",
      parking: "Free Parking Available",
      certified: "Certified Aestheticians",
      cleanEnv: "Clean & Sterilized Environment",
    },
    es: {
      securing: "Asegurando datos...",
      stepService: "1. Servicio",
      stepStylist: "2. Estilista",
      stepSlot: "3. Horario",
      stepClient: "4. Cliente",
      stepDone: "5. Listo",
      categoryAll: "Todo el Menú",
      selectServiceTitle: "Selecciona tu Servicio",
      selectServiceSub: "Elige el servicio de tu preferencia para continuar con la reserva.",
      backBtn: "← Atrás",
      chooseStylistTitle: "Elige tu Estilista",
      chooseStylistSub: "Selecciona un técnico estético específico o elige cualquier especialista disponible.",
      anySpecialist: "Cualquier Especialista Disponible",
      anySpecialistBio: "Elige esta opción para obtener la cita lo más pronto posible",
      selectSlotTitle: "Selecciona Fecha y Hora",
      noSlots: "No hay turnos disponibles para los próximos 14 días. Intenta seleccionar otro especialista.",
      loadingSlots: "Cargando horarios disponibles...",
      clientDetailsTitle: "Datos de Contacto",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo Electrónico",
      phone: "Número de Teléfono",
      submitBooking: "Confirmar Cita",
      summaryTitle: "Resumen de tu Cita",
      summaryService: "Servicio",
      summaryDuration: "Duración",
      summaryPrice: "Precio Total",
      summarySpecialist: "Especialista",
      summaryDate: "Fecha y Hora",
      summaryLocation: "Ubicación",
      summaryPlaceholder: "Por favor selecciona un servicio para ver el resumen de tu reserva.",
      bookedTitle: "¡Cita Confirmada!",
      bookedSub: "¡Muchas gracias! Tu cita ha sido registrada. Se ha enviado un correo de confirmación.",
      bookedRef: "Referencia de Reserva",
      bookedStatus: "Estado",
      bookedInfo: "Nuestro equipo se pondrá en contacto si es necesario realizar algún ajuste de horario.",
      mins: "min",
      freeText: "Gratis",
      returnHome: "Volver al Inicio",
      parking: "Estacionamiento gratis disponible",
      certified: "Esteticistas certificadas",
      cleanEnv: "Ambiente limpio y esterilizado",
    }
  };

  const t = dictionary[lang];

  const getTranslatedServiceName = (service: Service | null) => {
    if (!service) return "";
    const isEs = lang === "es";
    const key = service.name.toLowerCase().trim();
    return isEs && serviceTranslations[key] ? serviceTranslations[key].name : service.name;
  };

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

  const API_BASE = (() => {
    if (import.meta.env.PUBLIC_API_URL) {
      return import.meta.env.PUBLIC_API_URL;
    }
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.endsWith("lashesmglamour.com")) {
        return "https://api.lashesmglamour.com/api/v1";
      }
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `http://${hostname}:8000/api/v1`;
      }
    }
    return "http://localhost:8000/api/v1";
  })();



  // Load initial data: Categories and Services
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const [catsRes, servsRes] = await Promise.all([
          fetch(`${API_BASE}/categories`).then(r => {
            if (!r.ok) throw new Error("Failed to load categories");
            return r.json();
          }),
          fetch(`${API_BASE}/services`).then(r => {
            if (!r.ok) throw new Error("Failed to load services");
            return r.json();
          }),
        ]);
        
        setCategories(Array.isArray(catsRes) ? catsRes : []);
        setServices(Array.isArray(servsRes) ? servsRes : []);
        
        // If query param lists specific service, set it
        const urlParams = new URLSearchParams(window.location.search);
        const preselectedServiceId = urlParams.get("service");
        if (preselectedServiceId && Array.isArray(servsRes) && servsRes.length) {
          const found = servsRes.find((s: Service) => s.id === preselectedServiceId);
          if (found) {
            setSelectedService(found);
            setSelectedCategory(found.category_id);
            setStep(2); // Go to staff selection
          }
        }
      } catch (err: any) {
        console.error("Failed to load catalog:", err);
        setError(err.message || "Failed to connect to catalog database. Make sure backend is running.");
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
          const response = await fetch(`${API_BASE}/staff`);
          if (!response.ok) throw new Error("Failed to load staff list.");
          const res = await response.json();
          setStaffList(Array.isArray(res) ? res : []);
        } catch (err: any) {
          setError(err.message || "Failed to load staff list.");
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

          const response = await fetch(url);
          if (!response.ok) {
            const errJson = await response.json();
            throw new Error(errJson.detail || "Failed to load availability slots.");
          }
          const res = await response.json();
          if (Array.isArray(res)) {
            setAvailability(res);
          } else {
            setAvailability([]);
          }
        } catch (err: any) {
          setError(err.message || "Failed to load availability slots.");
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

    const [year, month, day] = selectedDate.split("-").map(Number);
    const [hour, minute] = selectedSlot.split(":");
    const bookingDateTime = new Date(year, month - 1, day, parseInt(hour), parseInt(minute), 0);


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
      lang: lang,
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
            <span className={step === 1 ? "text-brand-pink" : ""}>{t.stepService}</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 2 ? "text-brand-pink" : ""}>{t.stepStylist}</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 3 ? "text-brand-pink" : ""}>{t.stepSlot}</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 4 ? "text-brand-pink" : ""}>{t.stepClient}</span>
            <span className="text-zinc-300">&rarr;</span>
            <span className={step === 5 ? "text-brand-pink" : ""}>{t.stepDone}</span>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-30">
              <div className="flex flex-col items-center space-y-4">
                <span className="animate-spin text-brand-pink text-3xl">⏳</span>
                <span className="text-brand-pink font-bold tracking-widest text-sm uppercase">{t.securing}</span>
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
              <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">{t.selectServiceTitle}</h2>
              
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
                  {t.categoryAll}
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
                    {lang === "es" && cat.name.toLowerCase() === "lashes" ? "Pestañas" :
                     lang === "es" && cat.name.toLowerCase() === "brows" ? "Cejas" :
                     lang === "es" && cat.name.toLowerCase() === "skincare" ? "Piel" :
                     lang === "es" && cat.name.toLowerCase() === "waxing" ? "Depilación" :
                     lang === "es" && cat.name.toLowerCase().includes("facial") ? "Tratamientos Faciales" :
                     lang === "es" && cat.name.toLowerCase().includes("acne") ? "Tratamientos de Acné" : cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 max-h-[400px] overflow-y-auto pr-1">
                {activeServices.map(service => {
                  const isEs = lang === "es";
                  const translationKey = service.name.toLowerCase().trim();
                  const sName = isEs && serviceTranslations[translationKey] ? serviceTranslations[translationKey].name : service.name;
                  const sDesc = isEs && serviceTranslations[translationKey] ? serviceTranslations[translationKey].description : service.description;
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="bg-white border border-brand-border p-5 rounded-xl flex justify-between items-center cursor-pointer transition-all hover:border-brand-pink/30 hover:shadow-sm hover:translate-y-[-2px]"
                    >
                      <div className="space-y-1 pr-6">
                        <h3 className="font-heading font-bold text-base text-brand-charcoal">{sName}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                          {sDesc}
                        </p>
                        <span className="text-xs text-brand-pink font-semibold block pt-1">⏱️ {service.duration_minutes} {t.mins}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-brand-pink font-bold text-lg tracking-wider block">
                          ${(service.price_cents / 100).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold mt-1">
                          {lang === "es" ? "Elegir" : "Select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: STYLIST CHOICE */}
          {step === 2 && selectedService && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">{t.chooseStylistTitle}</h2>
                <button onClick={() => setStep(1)} className="text-xs text-brand-pink hover:underline font-bold">{t.backBtn}</button>
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
                    <h3 className="font-bold text-brand-charcoal text-base">{t.anySpecialist}</h3>
                    <p className="text-xs text-zinc-500">{t.anySpecialistBio}</p>
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
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-1">{translateBio(staff.bio, lang === "es")}</p>
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
                <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">{t.selectSlotTitle}</h2>
                <button onClick={() => setStep(2)} className="text-xs text-brand-pink hover:underline font-bold">{t.backBtn}</button>
              </div>

              {availability.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  {t.noSlots}
                </div>
              ) : (
                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1">
                  {availability.map(day => (
                    <div key={day.date} className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-pink border-b border-brand-border pb-1">
                        {(() => {
                          const [y, m, d] = day.date.split("-").map(Number);
                          const localDate = new Date(y, m - 1, d);
                          return localDate.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          });
                        })()}
                      </h3>

                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {day.slots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => handleSlotSelect(day.date, slot)}
                            className="border border-brand-pink/15 bg-brand-pink/5 text-brand-charcoal hover:bg-brand-pink hover:text-white text-xs font-semibold py-2 rounded transition-colors text-center"
                          >
                            {format12Hour(slot)}
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
                <h2 className="font-heading text-2xl text-brand-charcoal font-bold tracking-wide">{t.clientDetailsTitle}</h2>
                <button onClick={() => setStep(3)} className="text-xs text-brand-pink hover:underline font-bold">{t.backBtn}</button>
              </div>

              <form onSubmit={handleCustomerSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.firstName}</label>
                    <input
                      type="text"
                      required
                      value={customer.first_name}
                      onChange={e => setCustomer({ ...customer, first_name: e.target.value })}
                      className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.lastName}</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.phone}</label>
                  <input
                    type="tel"
                    required
                    placeholder="+17864606580"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-white border border-brand-border rounded-lg p-3 text-sm focus:outline-none focus:border-brand-pink text-brand-charcoal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold uppercase tracking-wider py-4 rounded transition-colors text-sm shadow-lg shadow-brand-pink/20 mt-6"
                >
                  {t.submitBooking}
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
                <h2 className="font-heading text-3xl text-brand-pink font-bold tracking-wide">{t.bookedTitle}</h2>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                  {t.bookedSub}
                </p>
              </div>

              <div className="bg-brand-light-pink p-6 rounded-xl border border-brand-pink/10 max-w-sm mx-auto space-y-3 text-sm">
                <div className="flex justify-between border-b border-brand-pink/5 pb-2">
                  <span className="text-zinc-500">{t.bookedRef}:</span>
                  <span className="font-mono text-brand-pink font-bold">{bookingResult.id.slice(-8).toUpperCase()}</span>
                </div>
                <div class="flex justify-between border-b border-brand-pink/5 pb-2">
                  <span class="text-zinc-500">{t.summaryService}:</span>
                  <span class="text-brand-charcoal font-semibold">{getTranslatedServiceName(selectedService)}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-zinc-500">{t.summaryDate}:</span>
                  <span className="text-brand-charcoal font-semibold">
                    {new Date(bookingResult.start_time).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                      month: "short",
                      day: "numeric",
                    })} {lang === "es" ? "a las" : "at"} {new Date(bookingResult.start_time).toLocaleTimeString(lang === "es" ? "es-ES" : "en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              <a href={lang === "es" ? "/es" : "/"} className="inline-block bg-brand-charcoal hover:bg-brand-pink text-white font-bold uppercase tracking-wider text-xs px-8 py-3.5 rounded transition-all shadow-md">
                {t.returnHome}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Persistent Booking Summary Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-brand-light-pink border border-brand-pink/15 p-6 rounded-2xl shadow-sm space-y-6 sticky top-28">
          <h3 className="font-heading text-lg font-bold text-brand-charcoal border-b border-brand-pink/10 pb-3 uppercase tracking-wide">
            {t.summaryTitle}
          </h3>
          
          {selectedService ? (
            <div className="space-y-4 text-sm text-zinc-600">
              {/* Selected Service Row */}
              <div className="border-b border-brand-pink/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">{t.summaryService}</span>
                <span className="font-bold text-brand-charcoal block text-base mt-1 leading-tight">{getTranslatedServiceName(selectedService)}</span>
                <span className="text-xs text-zinc-400 block mt-0.5">⏱️ {selectedService.duration_minutes} {t.mins}</span>
              </div>
              
              {/* Specialist Row */}
              <div className="border-b border-brand-pink/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">{t.summarySpecialist}</span>
                <span className="font-semibold text-brand-charcoal block mt-1">
                  {selectedStaff === "any" ? t.anySpecialist : staffList.find(s => s.id === selectedStaff)?.first_name || "Esteticista"}
                </span>
              </div>
              
              {/* Date & Time Row */}
              {selectedDate && selectedSlot && (
                <div className="border-b border-brand-pink/5 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">{t.summaryDate}</span>
                  <span className="font-semibold text-brand-charcoal block mt-1">
                    {(() => {
                      const [y, m, d] = selectedDate.split("-").map(Number);
                      const localDate = new Date(y, m - 1, d);
                      return localDate.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      });
                    })()} {lang === "es" ? "a las" : "at"} {format12Hour(selectedSlot)}

                  </span>
                </div>
              )}

              {/* Location Row */}
              <div className="border-b border-brand-pink/5 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">{t.summaryLocation}</span>
                <span className="text-xs block mt-1">📍 4095 SW 137th Ave #3, Miami, FL 33175</span>
              </div>

              {/* Total Price Box */}
              <div className="pt-2 flex justify-between items-baseline">
                <span className="font-bold text-brand-charcoal">{t.summaryPrice}:</span>
                <span className="text-brand-pink font-extrabold text-2xl">
                  ${(selectedService.price_cents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs italic">
              {t.summaryPlaceholder}
            </div>
          )}
          
          {/* Trust badges */}
          <div className="border-t border-brand-pink/10 pt-4 space-y-2.5 text-xs text-zinc-500">
            <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> {t.parking}</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> {t.certified}</p>
            <p className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> {t.cleanEnv}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

