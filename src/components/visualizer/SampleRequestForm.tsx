'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getMaterialById } from '@/lib/materials';
import { sendEmbedEvent } from '@/lib/embed/events';
import { useKitchenVisualizer } from '@/store/useKitchenVisualizer';
import { useEffect, useState } from 'react';

export function SampleRequestForm() {
  const {
    customer,
    updateCustomer,
    selectedSampleIds,
    visualizations,
    kitchenImageStorageKey,
    attribution,
    isSubmitting,
    setIsSubmitting,
    setRequestId,
    setStep,
  } = useKitchenVisualizer();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    sendEmbedEvent('sample_form_view');
  }, []);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!customer.firstName.trim()) nextErrors.firstName = 'Voornaam is verplicht';
    if (!customer.lastName.trim()) nextErrors.lastName = 'Achternaam is verplicht';
    if (!customer.email.trim()) nextErrors.email = 'E-mailadres is verplicht';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      nextErrors.email = 'Voer een geldig e-mailadres in';
    }
    if (!customer.street.trim()) nextErrors.street = 'Straat is verplicht';
    if (!customer.houseNumber.trim()) nextErrors.houseNumber = 'Huisnummer is verplicht';
    if (!customer.postalCode.trim()) nextErrors.postalCode = 'Postcode is verplicht';
    if (!customer.city.trim()) nextErrors.city = 'Plaats is verplicht';
    if (!customer.consent) nextErrors.consent = 'Je moet akkoord gaan met het privacybeleid';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const samples = selectedSampleIds
      .map((id) => {
        const material = getMaterialById(id);
        if (!material) return null;
        return {
          id: material.id,
          name: material.name,
          code: material.code,
          sku: material.sku,
          visualizationUrl: visualizations[id]?.imageUrl,
        };
      })
      .filter(Boolean);

    try {
      const response = await fetch('/api/sample-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            firstName: customer.firstName.trim(),
            lastName: customer.lastName.trim(),
            email: customer.email.trim(),
            phone: customer.phone.trim() || undefined,
            address: {
              street: customer.street.trim(),
              houseNumber: customer.houseNumber.trim(),
              addition: customer.addition.trim() || undefined,
              postalCode: customer.postalCode.trim(),
              city: customer.city.trim(),
            },
          },
          samples,
          kitchenImage: kitchenImageStorageKey ?? undefined,
          message: customer.message.trim() || undefined,
          consent: customer.consent,
          attribution,
        }),
      });

      const data = (await response.json()) as { requestId?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? 'Aanvraag kon niet worden verzonden');
      }

      if (data.requestId) setRequestId(data.requestId);
      sendEmbedEvent('sample_request_submitted', { sampleCount: samples.length });
      setStep('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Er ging iets mis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Voornaam</Label>
          <Input
            id="firstName"
            value={customer.firstName}
            onChange={(e) => updateCustomer({ firstName: e.target.value })}
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Achternaam</Label>
          <Input
            id="lastName"
            value={customer.lastName}
            onChange={(e) => updateCustomer({ lastName: e.target.value })}
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            type="email"
            value={customer.email}
            onChange={(e) => updateCustomer({ email: e.target.value })}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Telefoonnummer (optioneel)</Label>
          <Input
            id="phone"
            type="tel"
            value={customer.phone}
            onChange={(e) => updateCustomer({ phone: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="street">Straat</Label>
          <Input
            id="street"
            value={customer.street}
            onChange={(e) => updateCustomer({ street: e.target.value })}
          />
          {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
        </div>
        <div>
          <Label htmlFor="houseNumber">Huisnummer</Label>
          <Input
            id="houseNumber"
            value={customer.houseNumber}
            onChange={(e) => updateCustomer({ houseNumber: e.target.value })}
          />
          {errors.houseNumber && <p className="mt-1 text-sm text-red-600">{errors.houseNumber}</p>}
        </div>
        <div>
          <Label htmlFor="addition">Toevoeging</Label>
          <Input
            id="addition"
            value={customer.addition}
            onChange={(e) => updateCustomer({ addition: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postcode</Label>
          <Input
            id="postalCode"
            value={customer.postalCode}
            onChange={(e) => updateCustomer({ postalCode: e.target.value })}
          />
          {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
        </div>
        <div>
          <Label htmlFor="city">Plaats</Label>
          <Input
            id="city"
            value={customer.city}
            onChange={(e) => updateCustomer({ city: e.target.value })}
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Opmerking (optioneel)</Label>
        <Textarea
          id="message"
          value={customer.message}
          onChange={(e) => updateCustomer({ message: e.target.value })}
        />
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={customer.consent}
          onChange={(e) => updateCustomer({ consent: e.target.checked })}
        />
        <Label htmlFor="consent" className="font-normal leading-relaxed">
          Ik ga akkoord met het privacybeleid.
        </Label>
      </div>
      {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Aanvraag versturen...' : 'Vraag mijn samples aan'}
      </Button>
    </form>
  );
}
