def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "TaskBoard API"
    assert response.json()["docs"] == "/docs"


def test_ready(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "READY"}


def test_create_task(client):
    payload = {
        "title": "Configure EKS Cluster",
        "description": "Deploy AWS EKS managed nodes with Terraform",
        "priority": "HIGH",
        "assignee": "DevOps Engineer",
    }
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["title"] == payload["title"]
    assert data["status"] == "TODO"
    assert data["priority"] == "HIGH"


def test_list_tasks(client):
    # Initially empty
    res_empty = client.get("/api/tasks")
    assert res_empty.status_code == 200
    assert res_empty.json() == []

    # Insert two tasks
    client.post("/api/tasks", json={"title": "Task 1", "priority": "LOW"})
    client.post("/api/tasks", json={"title": "Task 2", "priority": "MEDIUM"})

    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2


def test_get_task_by_id(client):
    created = client.post("/api/tasks", json={"title": "Inspect Metrics", "priority": "MEDIUM"}).json()
    task_id = created["id"]

    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Inspect Metrics"


def test_get_task_not_found(client):
    response = client.get("/api/tasks/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_update_task(client):
    created = client.post("/api/tasks", json={"title": "Run Trivy Scan", "priority": "HIGH"}).json()
    task_id = created["id"]

    update_payload = {"status": "IN_PROGRESS", "priority": "MEDIUM"}
    response = client.put(f"/api/tasks/{task_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "IN_PROGRESS"
    assert data["priority"] == "MEDIUM"


def test_delete_task(client):
    created = client.post("/api/tasks", json={"title": "Temporary Task", "priority": "LOW"}).json()
    task_id = created["id"]

    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_res = client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 404


def test_tasks_stats(client):
    client.post("/api/tasks", json={"title": "Task A", "priority": "LOW"})
    t2 = client.post("/api/tasks", json={"title": "Task B", "priority": "MEDIUM"}).json()
    client.put(f"/api/tasks/{t2['id']}", json={"status": "IN_PROGRESS"})

    response = client.get("/api/tasks/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] == 2
    assert stats["todo"] == 1
    assert stats["inProgress"] == 1
    assert stats["done"] == 0
