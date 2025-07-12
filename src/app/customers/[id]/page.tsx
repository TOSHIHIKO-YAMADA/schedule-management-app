'use client';

import { CustomerForm } from '@/components/customers/CustomerForm';

interface CustomerEditPageProps {
  params: {
    id: string;
  };
}

export default function CustomerEditPage({ params }: CustomerEditPageProps) {
  return <CustomerForm customerId={params.id} />;
}