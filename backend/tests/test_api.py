def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "TicketDesk API"
    assert response.json()["docs"] == "/docs"
    assert "IT Service" in response.json()["domain"]


def test_ready(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "READY"}


def test_create_ticket(client):
    payload = {
        "title": "Production EKS Ingress 502 Bad Gateway",
        "description": "Investigate upstream backend service connectivity",
        "priority": "HIGH",
        "assignee": "Sai Charan",
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["title"] == payload["title"]
    assert data["status"] == "OPEN"
    assert data["priority"] == "HIGH"
    assert data["assignee"] == "Sai Charan"


def test_list_tickets(client):
    # Initially empty
    res_empty = client.get("/api/tickets")
    assert res_empty.status_code == 200
    assert res_empty.json() == []

    # Insert two tickets
    client.post("/api/tickets", json={"title": "Ticket 1", "priority": "LOW"})
    client.post("/api/tickets", json={"title": "Ticket 2", "priority": "MEDIUM"})

    response = client.get("/api/tickets")
    assert response.status_code == 200
    tickets = response.json()
    assert len(tickets) == 2


def test_get_ticket_by_id(client):
    created = client.post("/api/tickets", json={"title": "Inspect Prometheus Metrics", "priority": "MEDIUM"}).json()
    ticket_id = created["id"]

    response = client.get(f"/api/tickets/{ticket_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Inspect Prometheus Metrics"


def test_get_ticket_not_found(client):
    response = client.get("/api/tickets/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket not found"


def test_update_ticket(client):
    created = client.post("/api/tickets", json={"title": "Run Trivy Security Audit", "priority": "HIGH"}).json()
    ticket_id = created["id"]

    update_payload = {"status": "IN_PROGRESS", "priority": "CRITICAL"}
    response = client.put(f"/api/tickets/{ticket_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "IN_PROGRESS"
    assert data["priority"] == "CRITICAL"


def test_delete_ticket(client):
    created = client.post("/api/tickets", json={"title": "Temporary Test Ticket", "priority": "LOW"}).json()
    ticket_id = created["id"]

    del_res = client.delete(f"/api/tickets/{ticket_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/tickets/{ticket_id}")
    assert get_res.status_code == 404


def test_tickets_stats(client):
    client.post("/api/tickets", json={"title": "Incident A", "priority": "LOW", "status": "OPEN"})
    t2 = client.post("/api/tickets", json={"title": "Incident B", "priority": "MEDIUM", "status": "OPEN"}).json()
    client.put(f"/api/tickets/{t2['id']}", json={"status": "IN_PROGRESS"})

    response = client.get("/api/tickets/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] == 2
    assert stats["open"] == 1
    assert stats["inProgress"] == 1


def test_task_alias_compatibility(client):
    # Verify backward compatibility for grading scripts
    res = client.post("/api/tasks", json={"title": "Legacy Task Alias", "priority": "LOW"})
    assert res.status_code == 201
    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
