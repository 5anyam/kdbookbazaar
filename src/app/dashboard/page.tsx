"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/AuthContext";
import {
  Package, Clock, CheckCircle, XCircle, Truck, LogOut,
  User, Mail, RefreshCw, AlertCircle, ShoppingBag,
  ChevronDown, ChevronUp, X, RotateCcw, Phone,
  MapPin, Edit2, Save, Loader2
} from "lucide-react";
import Link from "next/link";

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan",
  "Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal",
];

interface LineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
}

interface Order {
  id: number;
  status: string;
  total: string;
  date_created: string;
  customer_id: number;
  payment_method_title: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
  };
  line_items: LineItem[];
}

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
}

type ModalType = 'cancel' | 'refund' | null;

const STATUS_STYLES: Record<string, string> = {
  completed:  'bg-green-100 text-green-800 border-green-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  'on-hold':  'bg-orange-100 text-orange-800 border-orange-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
  failed:     'bg-red-100 text-red-800 border-red-200',
  refunded:   'bg-purple-100 text-purple-800 border-purple-200',
};

function StatusBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    completed:  <CheckCircle className="w-3 h-3" />,
    processing: <Truck className="w-3 h-3" />,
    pending:    <Clock className="w-3 h-3" />,
    'on-hold':  <Clock className="w-3 h-3" />,
    cancelled:  <XCircle className="w-3 h-3" />,
    failed:     <XCircle className="w-3 h-3" />,
    refunded:   <RotateCcw className="w-3 h-3" />,
  };

  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  const icon = icons[status] || <Package className="w-3 h-3" />;
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}>
      {icon}{label}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newOrderId = Number(searchParams.get('order') || 0);
  const { user, loading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(newOrderId || null);
  const newOrderRef = useRef<HTMLDivElement>(null);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    first_name: '', last_name: '', phone: '',
    address_1: '', city: '', state: '', postcode: '',
  });

  // Modal state
  const [modal, setModal] = useState<{ type: ModalType; orderId: number } | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  // Fetch WC customer billing profile
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const auth = btoa(
        `${process.env.NEXT_PUBLIC_CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7'}:${process.env.NEXT_PUBLIC_CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848'}`
      );
      const res = await fetch(
        `https://cms.kdbookbazaar.com/wp-json/wc/v3/customers/${user.id}`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const b = data.billing || {};
        setProfileForm({
          first_name: data.first_name || b.first_name || user.first_name || '',
          last_name: data.last_name || b.last_name || user.last_name || '',
          phone: b.phone || '',
          address_1: b.address_1 || '',
          city: b.city || '',
          state: b.state || '',
          postcode: b.postcode || '',
        });
      }
    } catch { /* ignore */ }
    finally { setProfileLoading(false); }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const auth = btoa(
        `${process.env.NEXT_PUBLIC_CONSUMER_KEY || 'ck_b2cff698fa447d779aa56d980ea00fea049721a7'}:${process.env.NEXT_PUBLIC_CONSUMER_SECRET || 'cs_1f8a7857e2e4030a0a8222979673ef040c763848'}`
      );
      const res = await fetch(
        `https://cms.kdbookbazaar.com/wp-json/wc/v3/orders?customer=${user.id}&per_page=50&order=desc`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      setOrders(await res.json());
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchProfile();
    }
  }, [user, fetchOrders, fetchProfile]);

  // Scroll to new order after orders load
  useEffect(() => {
    if (!ordersLoading && newOrderId && newOrderRef.current) {
      setTimeout(() => {
        newOrderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [ordersLoading, newOrderId]);

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.id, ...profileForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setProfileSuccess('Profile updated successfully!');
      setEditingProfile(false);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const openModal = (type: ModalType, orderId: number) => {
    setModal({ type, orderId });
    setActionError('');
    setActionSuccess('');
    setRefundReason('');
  };

  const closeModal = () => {
    setModal(null);
    setActionError('');
    setActionSuccess('');
  };

  const handleCancel = async () => {
    if (!modal || !user) return;
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: modal.orderId, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
      setActionSuccess('Order cancelled successfully.');
      setOrders((prev) =>
        prev.map((o) => (o.id === modal.orderId ? { ...o, status: 'cancelled' } : o))
      );
      setTimeout(closeModal, 1500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!modal || !user) return;
    if (!refundReason.trim()) { setActionError('Please provide a reason for the refund.'); return; }
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/orders/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: modal.orderId, userId: user.id, reason: refundReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit refund request');
      setActionSuccess('Refund request submitted! Our team will contact you within 2-3 business days.');
      setTimeout(closeModal, 2500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit refund');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-[#ff3131] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {profileForm.first_name || user.first_name || user.username}!</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Shop
            </Link>
            <button onClick={logout} className="px-4 py-2 bg-[#ff3131] text-white rounded-xl hover:bg-[#cc0000] transition-all text-sm font-medium flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Account Details</h2>
            {!editingProfile && (
              <button
                onClick={() => { setEditingProfile(true); setProfileError(''); setProfileSuccess(''); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#ff3131] hover:text-[#cc0000] transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" /> {profileSuccess}
            </div>
          )}

          {!editingProfile ? (
            /* ── READ MODE ── */
            profileLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading profile...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoRow icon={<User className="w-5 h-5 text-[#ff3131]" />} label="Name"
                  value={profileForm.first_name || profileForm.last_name
                    ? `${profileForm.first_name} ${profileForm.last_name}`.trim()
                    : user.username}
                />
                <InfoRow icon={<Mail className="w-5 h-5 text-[#ff3131]" />} label="Email" value={user.email} />
                <InfoRow icon={<Phone className="w-5 h-5 text-[#ff3131]" />} label="Phone" value={profileForm.phone || '—'} />
                <InfoRow icon={<Package className="w-5 h-5 text-[#ff3131]" />} label="Total Orders" value={String(orders.length)} />
                {profileForm.address_1 && (
                  <div className="sm:col-span-2">
                    <InfoRow
                      icon={<MapPin className="w-5 h-5 text-[#ff3131]" />}
                      label="Saved Address"
                      value={[profileForm.address_1, profileForm.city, profileForm.state, profileForm.postcode].filter(Boolean).join(', ')}
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            /* ── EDIT MODE ── */
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                  <input
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))}
                    className={inputCls} placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                  <input
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))}
                    className={inputCls} placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className={inputCls} placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                <textarea
                  value={profileForm.address_1}
                  onChange={(e) => setProfileForm((p) => ({ ...p, address_1: e.target.value }))}
                  className={`${inputCls} resize-none`} rows={2}
                  placeholder="House no., Street, Landmark..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">City</label>
                  <input
                    value={profileForm.city}
                    onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                    className={inputCls} placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">State</label>
                  <select
                    value={profileForm.state}
                    onChange={(e) => setProfileForm((p) => ({ ...p, state: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Pincode</label>
                  <input
                    value={profileForm.postcode}
                    onChange={(e) => setProfileForm((p) => ({ ...p, postcode: e.target.value }))}
                    className={inputCls} placeholder="6-digit"
                  />
                </div>
              </div>

              {profileError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {profileError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setEditingProfile(false); setProfileError(''); fetchProfile(); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="flex-1 py-2.5 bg-[#ff3131] hover:bg-[#cc0000] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  {profileSaving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save Changes</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── ORDERS SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-900">My Orders</h2>
            <button
              onClick={fetchOrders}
              disabled={ordersLoading}
              className="text-xs text-gray-500 hover:text-[#ff3131] flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-gray-200 border-t-[#ff3131] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading orders...</p>
            </div>
          ) : ordersError ? (
            <div className="text-center py-12">
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-600 mb-4">{ordersError}</p>
              <button onClick={fetchOrders} className="px-5 py-2 bg-[#ff3131] text-white rounded-xl text-sm font-medium hover:bg-[#cc0000] transition-all">Retry</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-1">No orders yet</p>
              <p className="text-sm text-gray-400 mb-6">Start shopping and your orders will appear here.</p>
              <Link href="/" className="inline-block px-6 py-2.5 bg-[#ff3131] text-white rounded-xl text-sm font-bold hover:bg-[#cc0000] transition-all">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const canCancel = ['pending', 'processing', 'on-hold'].includes(order.status);
                const canRefund = ['completed', 'processing'].includes(order.status);
                const isExpanded = expandedOrder === order.id;
                const isNew = order.id === newOrderId;

                return (
                  <div
                    key={order.id}
                    ref={isNew ? newOrderRef : undefined}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      isNew
                        ? 'border-[#ff3131] shadow-md shadow-red-100 ring-1 ring-[#ff3131]/30'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer select-none"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isNew ? 'bg-[#ff3131]/10' : 'bg-gray-50'}`}>
                          <Package className={`w-4 h-4 ${isNew ? 'text-[#ff3131]' : 'text-gray-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                            <StatusBadge status={order.status} />
                            {isNew && (
                              <span className="text-[10px] font-bold text-[#ff3131] bg-[#ff3131]/10 px-2 py-0.5 rounded-full">New Order</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.date_created)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <div className="text-right hidden sm:block">
                          <p className="text-[11px] text-gray-400">Total</p>
                          <p className="text-sm font-bold text-gray-900">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Items Ordered</p>
                          <div className="space-y-1.5">
                            {order.line_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                                <span className="font-semibold text-gray-900 shrink-0 ml-2">₹{parseFloat(item.total).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
                          <p className="text-sm text-gray-700">
                            {order.billing.first_name} {order.billing.last_name}
                            {order.billing.address_1 && `, ${order.billing.address_1}`}
                            {order.billing.city && `, ${order.billing.city}`}
                            {order.billing.state && ` - ${order.billing.state}`}
                            {order.billing.postcode && ` ${order.billing.postcode}`}
                          </p>
                          {order.billing.phone && (
                            <p className="text-xs text-gray-400 mt-0.5">📞 {order.billing.phone}</p>
                          )}
                        </div>

                        <div className="sm:hidden">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Order Total</p>
                          <p className="text-base font-bold text-gray-900">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-400">{order.payment_method_title}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                          {canCancel && (
                            <button
                              onClick={() => openModal('cancel', order.id)}
                              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel Order
                            </button>
                          )}
                          {canRefund && (
                            <button
                              onClick={() => openModal('refund', order.id)}
                              className="px-4 py-2 border border-orange-200 text-orange-600 hover:bg-orange-50 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Request Refund
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            {modal.type === 'cancel' ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cancel Order #{modal.orderId}</h3>
                    <p className="text-xs text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  Are you sure you want to cancel this order? An SMS and email confirmation will be sent to you. If you paid online, refund will be processed within 5–7 business days.
                </p>
                {actionError && <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {actionError}</div>}
                {actionSuccess && <div className="mb-4 flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> {actionSuccess}</div>}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Keep Order</button>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading || !!actionSuccess}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cancelling...</> : 'Yes, Cancel'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Refund Request — Order #{modal.orderId}</h3>
                    <p className="text-xs text-gray-500">We&apos;ll review within 2–3 business days.</p>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Reason for Refund *</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-[#ff3131] focus:ring-2 focus:ring-[#ff3131]/10 focus:bg-white transition-all placeholder:text-gray-400 resize-none"
                    placeholder="e.g. Wrong item received, Item damaged, Changed my mind..."
                  />
                </div>
                {actionError && <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {actionError}</div>}
                {actionSuccess && <div className="mb-4 flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> {actionSuccess}</div>}
                <div className="flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">Cancel</button>
                  <button
                    onClick={handleRefund}
                    disabled={actionLoading || !!actionSuccess}
                    className="flex-1 py-2.5 bg-[#ff3131] hover:bg-[#cc0000] disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : 'Submit Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#ff3131]/10 rounded-full flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
