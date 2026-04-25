'use client';

import { PricingTable } from '@clerk/nextjs';
import { Show } from '@clerk/nextjs';

export default function PricingSection() {
  return (
    <section id="pricing" className="wrapper py-18 min-h-screen flex flex-col items-center justify-center">
      <h1 className="page-title">Choose Your Plan</h1>
      <p className="page-description">
        Unlock more books, longer sessions, and advanced features
      </p>
<br/>
<br/>
      <Show when="signed-in">
        <div className="clerk-pricing-table-wrapper w-full">
          <PricingTable />
        </div>
      </Show>

      <Show when="signed-out" fallback={null}>
        <div className="text-center mt-8">
          <p className="text-lg text-[var(--text-secondary)] mb-4">
            Please sign in to view subscription plans
          </p>
        </div>
      </Show>
    </section>
  );
}
