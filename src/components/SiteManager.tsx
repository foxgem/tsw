import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const Button = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: #45a049;
  }
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  background-color: white;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TimerInfo = styled.div`
  margin-bottom: 5px;
`;

const RemoveButton = styled(Button)`
  background-color: #f44336;
  font-size: 0.9em;

  &:hover {
    background-color: #d32f2f;
  }
`;

interface SiteTimer {
  domain: string;
  time: number;
}

const SiteManager: React.FC = () => {
  const [siteTimers, setSiteTimers] = useState<SiteTimer[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [newTime, setNewTime] = useState(0);

  useEffect(() => {
    loadSiteTimers();
  }, []);

  const loadSiteTimers = () => {
    chrome.storage.local.get(null, (items) => {
      const timers: SiteTimer[] = Object.entries(items).map(([domain, time]) => ({
        domain,
        time: time as number,
      }));
      setSiteTimers(timers);
    });
  };

  const handleAddTimer = () => {
    if (newDomain && newTime > 0) {
      chrome.storage.local.set({ [newDomain]: newTime }, () => {
        loadSiteTimers();
        setNewDomain("");
        setNewTime(0);
      });
    }
  };

  const handleRemoveTimer = (domain: string) => {
    chrome.storage.local.remove(domain, () => {
      loadSiteTimers();
    });
  };

  return (
    <Container>
      <InputGroup>
        <Input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="Enter domain (e.g., example.com)"
        />
        <Input
          type="number"
          value={newTime}
          onChange={(e) => setNewTime(parseInt(e.target.value))}
          placeholder="Enter time in seconds"
        />
        <Button onClick={handleAddTimer}>Add Timer</Button>
      </InputGroup>
      <List>
        {siteTimers.map((timer) => (
          <ListItem key={timer.domain}>
            <TimerInfo>
              {timer.domain}: {timer.time} seconds
            </TimerInfo>
            <RemoveButton onClick={() => handleRemoveTimer(timer.domain)}>Remove</RemoveButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SiteManager;
