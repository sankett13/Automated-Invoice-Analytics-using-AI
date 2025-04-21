import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InvoiceCharts = () => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/invoices/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorMessage = await res.json();
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorMessage.error || 'Unknown error'}`);
        }

        const responseData = await res.json();
        console.log(responseData);
        setInvoiceData(responseData.invoices || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching invoice data:', err);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-600 italic py-4">Loading charts...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">Error loading chart data: {error}</div>;
  }

  if (invoiceData.length === 0) {
    return <p className="text-gray-500 py-4">No invoice data available for charts.</p>;
  }

  // Prepare data for the Total Amount Bar Chart
  const totalAmountData = {
    labels: invoiceData.map((invoice) => invoice.invoice_number),
    datasets: [
      {
        label: 'Total Amount',
        backgroundColor: '#6366F1', // Indigo-500
        borderColor: '#4F46E5', // Indigo-600
        borderWidth: 1,
        data: invoiceData.map((invoice) => invoice.total_amount || 0),
      },
    ],
  };

  const totalAmountOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Total Amount per Invoice',
        font: {
          size: 14,
          weight: 'medium',
        },
        color: '#374151',
        padding: {
          bottom: 10,
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount',
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
        grid: {
          borderColor: '#E5E7EB', // Gray-200
          borderDash: [2, 2],
        },
      },
      x: {
        title: {
          display: true,
          text: 'Invoice',
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  // Prepare data for the Total Tax Pie Chart
  const totalTaxData = {
    labels: invoiceData.map((invoice) => invoice.invoice_number),
    datasets: [
      {
        label: 'Total Tax',
        backgroundColor: [
          '#F472B6', // Pink-400
          '#FACC15', // Yellow-400
          '#4ADE80', // Green-400
          '#A78BFA', // Purple-400
          '#F97316', // Orange-500
          '#38B2AC', // Teal-500
          '#EC4899', // Pink-500
          '#EAB308', // Yellow-500
          '#22C55E', // Green-500
          '#8B5CF6', // Purple-500
        ],
        borderColor: 'white',
        borderWidth: 1,
        data: invoiceData.map((invoice) => invoice.total_tax || 0),
      },
    ],
  };

  const totalTaxOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Tax Distribution Across Invoices',
        font: {
          size: 14,
          weight: 'medium',
        },
        color: '#374151',
        padding: {
          bottom: 10,
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          usePointStyle: true,
        },
      },
    },
  };

  // Prepare data for Category Wise Expense Doughnut Chart
  const categoryExpenses = {};
  invoiceData.forEach((invoice) => {
    if (invoice.category && invoice.total_amount) {
      categoryExpenses[invoice.category] =
        (categoryExpenses[invoice.category] || 0) + invoice.total_amount;
    }
  });

  const categoryLabels = Object.keys(categoryExpenses);
  const categoryDataValues = Object.values(categoryExpenses);
  const categoryColors = [
    '#2563EB', // Blue-600
    '#84CC16', // Lime-500
    '#CA8A04', // Amber-500
    '#DB2777', // Pink-500
    '#14B8A6', // Teal-500
    '#7C3AED', // Purple-600
    '#D97706', // Orange-500
    '#059669', // Green-600
    '#6D28D9', // Indigo-600
    '#EF4444', // Red-500
  ];

  const categoryDoughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryDataValues,
        backgroundColor: categoryColors,
        borderWidth: 1,
        borderColor: 'white',
        cutout: '50%', // Adjust for the thickness of the doughnut
      },
    ],
  };

  const categoryDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Expense Breakdown by Category',
        font: { size: 14, weight: 'medium', color: '#374151' },
        padding: { bottom: 10 },
      },
      legend: {
        position: 'bottom',
        labels: { color: '#6B7280', font: { size: 12 }, usePointStyle: true },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (context.parsed !== null) {
              label += `: $${context.parsed.toFixed(2)}`;
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Invoice Data Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="relative h-80">
          <div className="absolute top-0 left-0 w-full h-full">
            <Bar data={totalAmountData} options={totalAmountOptions} />
          </div>
        </div>

        <div className="relative h-80">
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Pie data={totalTaxData} options={totalTaxOptions} />
          </div>
        </div>

        <div className="relative h-80">
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Pie data={categoryDoughnutData} options={categoryDoughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCharts;