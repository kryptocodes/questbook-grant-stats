import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import NavBar from "./navbar";

import spinner from "./assets/spinner.svg";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GrantApplicationsBarChart = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });
  const [selectedGrant, setSelectedGrant] = useState(
    "65c7836df27e2e1702d2d279"
  );

  const [isLoading, setIsLoading] = useState(true);

  const fetchGrantApplications = async () => {
    const now = new Date();
    const timestamps = [];
    const results = [];
    const maxRetries = 3;

    for (let i = 0; i < 12; i++) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
        999
      );

      const gte = Math.floor(startOfMonth.getTime() / 1000);
      const lte = Math.floor(endOfMonth.getTime() / 1000);

      timestamps.push({ gte, lte });
    }

    for (const { gte, lte } of timestamps) {
      const query = `{
          grantApplications(
              filter: {
                  grant: "${selectedGrant}",
                  _operators: { createdAtS: { gte: ${gte}, lte: ${lte} } }
              }
              limit: 1000
          ) {
              _id
          }
      }`;

      let attempts = 0;
      let success = false;

      while (attempts < maxRetries && !success) {
        try {
          const response = await fetch(
            "https://api-grants.questbook.app/graphql",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query }),
            }
          );

          const result = await response.json();
          results.push(result.data.grantApplications.length);
          success = true;
        } catch (error) {
          attempts += 1;
          if (attempts === maxRetries) {
            results.push(0); // If it fails after max retries, push 0 to the results array
          }
        }
      }
    }

    return results.reverse();
  };

  useEffect(() => {
    const getData = async () => {
      const results = await fetchGrantApplications();
      const now = new Date();
      const labels = [];

      for (let i = 0; i < 12; i++) {
        const month = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        ).toLocaleString("default", { month: "long" });
        labels.unshift(month);
      }
      setIsLoading(false);
      setData({
        labels,
        datasets: [
          {
            label: "proposals",
            data: results,
            backgroundColor: "rgba(64, 162, 235)",
          },
        ],
      });
    };

    getData();
  }, [selectedGrant]);

  const grants = [
    { id: "65c7836df27e2e1702d2d279", name: "Ton Grants" },
    {
      id: "0x96e3ff60171310eeb7bd1b6216c74d4cc768870f",
      name: "Education & Resources Bounties",
    },
    {
      id: "0xd92881bea3923fec2d8e61aa947c981faa4ab970",
      name: "Developers & Community Tools Bounties",
    },
    {
      id: "663d2b4c7d71679fa9959bf6",
      name: "Asian-Pacific Focus Telegram Mini-App Grants",
    },
  ];

  return (
    <NavBar>
      <div
        className="flex 
              flex-col
            justify-center items-center"
      >
        {
          <div className=" p-4 lg:p-12">
            <h2 className="text-2xl font-semibold text-center mb-4">
              TON Grants Stats
            </h2>
            <select
              value={selectedGrant}
              onChange={(e) => {
                setSelectedGrant(e.target.value);
                setIsLoading(true);
              }}
              className="w-full p-2 m-2 text-white bg-gray-500"
            >
              {grants.map((grant) => (
                <option key={grant.id} value={grant.id}>
                  {grant.name}
                </option>
              ))}
            </select>
          </div>
        }

        {isLoading && (
          <div className="flex justify-center items-center h-screen">
            <img src={spinner}
              className="w-12 h-12"
            alt="Loading..." />
          </div>
        )}

        {!isLoading && data.labels.length === 0 && <p>No data available</p>}

        {!isLoading && data.labels.length > 0 && (
          <div className="w-full max-w-2xl lg:max-w-6xl p-4 lg:p-4">
            <h2 className="text-2xl font-semibold text-center mb-4">
              Grant Applications 
            </h2>
            <div className="p-4">
              <Bar
                data={data}
                style={{ width: "100%", height: "400px" }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: true,
                  bar: {
                    borderRadius: 10,
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </NavBar>
  );
};

export default GrantApplicationsBarChart;
