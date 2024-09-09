import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-height: 400px;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  width: 280px;
  padding: 24px;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 95%;
  margin-bottom: 12px;
  box-sizing: border-box;
`;

const Button = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 8px 12px;
  border-radius: 6px;
  width: 95%;
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
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TimerInfo = styled.div`
  margin-bottom: 5px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const RemoveButton = styled(Button)`
  background-color: #f44336;
  font-size: 0.9em;
  width: 48%;

  &:hover {
    background-color: #d32f2f;
  }
`;

const EditButton = styled(Button)`
  background-color: #2196f3;
  font-size: 0.9em;
  margin-right: 5px;
  width: 48%;

  &:hover {
    background-color: #1e88e5;
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
  const [editingTimer, setEditingTimer] = useState<SiteTimer | null>(null);

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

  const handleEditTimer = (timer: SiteTimer) => {
    setEditingTimer(timer);
    setNewDomain(timer.domain);
    setNewTime(timer.time);
  };

  const handleUpdateTimer = () => {
    if (editingTimer && newDomain && newTime > 0) {
      chrome.storage.local.remove(editingTimer.domain, () => {
        chrome.storage.local.set({ [newDomain]: newTime }, () => {
          loadSiteTimers();
          setEditingTimer(null);
          setNewDomain("");
          setNewTime(0);
        });
      });
    }
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
        {editingTimer ? (
          <Button onClick={handleUpdateTimer}>Update Timer</Button>
        ) : (
          <Button onClick={handleAddTimer}>Add Timer</Button>
        )}
      </InputGroup>
      <List>
        {siteTimers.map((timer) => (
          <ListItem key={timer.domain}>
            <TimerInfo>
              {timer.domain}: {timer.time} seconds
            </TimerInfo>
            <ButtonGroup>
              <EditButton onClick={() => handleEditTimer(timer)}>Edit</EditButton>
              <RemoveButton onClick={() => handleRemoveTimer(timer.domain)}>Remove</RemoveButton>
            </ButtonGroup>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default SiteManager;
