import React, { useState, useEffect } from 'react';

interface Data {
  title: string;
  description: string;
}

interface AsyncFetchComponentProps {
  url: string;
}

const AsyncFetchComponent: React.FC<AsyncFetchComponentProps> = ({ url }) => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result: Data = await response.json(); // Cast fetched data to Data type
        setData(result);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {/* Render fetched data here */}
      {data && (
        <div>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
};

export default AsyncFetchComponent;
