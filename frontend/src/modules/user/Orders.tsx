import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useThemeContext } from '../../context/ThemeContext';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Orders() {
  const { orders } = useOrders();
  const { currentTheme } = useThemeContext();

  const brandPrimary = currentTheme.primary[2] || '#F57C00';
  const brandSecondary = currentTheme.accentColor || '#7A3E8E';

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { backgroundColor: `${brandSecondary}15`, color: brandSecondary };
      case 'On the way':
      case 'Accepted':
      case 'Out for Delivery':
        return { backgroundColor: `${brandPrimary}15`, color: brandPrimary };
      case 'Placed':
      case 'Received':
        return { backgroundColor: '#F3F4F6', color: '#374151' };
      case 'Cancelled':
      case 'Returned':
        return { backgroundColor: '#FEE2E2', color: '#B91C1C' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-12 md:py-16 text-center">
        <div className="text-6xl md:text-8xl mb-4">📦</div>
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">No orders yet</h2>
        <p className="text-neutral-600 mb-6 md:mb-8 md:text-lg">Start shopping to see your orders here!</p>
        <Link
          to="/"
          className="inline-block text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:opacity-90 transition-all md:text-lg shadow-md"
          style={{ backgroundColor: brandPrimary }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-4 md:pb-8">
      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 bg-white border-b border-neutral-200 mb-4 md:mb-6 sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900">My Orders</h1>
      </div>

      <div className="px-4 md:px-6 lg:px-8 space-y-4 md:space-y-6">
        {orders.map((order) => {
          const shortId = order.id.split('-').slice(-1)[0];
          const statusStyle = getStatusStyles(order.status);
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900 mb-1">
                    Order #{shortId}
                  </div>
                  <div className="text-xs text-neutral-500">{formatDate(order.createdAt)}</div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={statusStyle}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                </div>
                <div className="text-lg font-bold text-neutral-900">
                  ₹{order.totalAmount.toFixed(0)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
