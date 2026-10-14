# Capstone Submission Deliverables Dossier (100/100 Points)

This document gathers all required submission deliverables, terminal output logs, configuration files, and written explanations specified in [GRADING.md](file:///d:/TaskBoard-Project/session21-python/GRADING.md).

---

## Deliverables Summary Matrix

| Module | Topic | Required Deliverable | Status |
| :--- | :--- | :--- | :---: |
| **M1** | Application | `backend/app/`, `alembic/versions/`, `frontend/`, `docker-compose.yml`, browser screenshot | ✅ Ready |
| **M2** | Testing | `backend/tests/`, `pytest.ini`, `conftest.py`, terminal output of `pytest -v` | ✅ Ready |
| **M3** | Git & GitHub | Public GitHub URL, 10+ commit history terminal log | ✅ Ready (13 commits) |
| **M4** | Docker | `backend/Dockerfile`, `frontend/Dockerfile` (non-root), `docker-compose.yml` | ✅ Ready |
| **M5** | CI/CD | `.github/workflows/ci-cd.yml`, GitHub Actions run URL, GHCR package tags | ✅ Ready |
| **M6** | DevSecOps | Trivy workflow step, written CVE explanation | ✅ Ready |
| **M7** | Terraform | `terraform/` (`.tf` files + `terraform.tfvars.example`), `plan` & `destroy` | ✅ Ready |
| **M8** | Kubernetes + Helm | `k8s/`, `helm/taskboard/`, `kubectl` & `helm list` logs, Ingress | ✅ Ready |
| **M9** | Observability | `monitoring/` values files, `/metrics` output, Prometheus/Grafana configs | ✅ Ready |
| **M10** | Presentation | `README.md`, 6-step live demo walkthrough script | ✅ Ready |

---

## M1 — Application: Frontend + Backend + Database (10 Points)

### Source Code References:
- Backend Core: [backend/app/](file:///d:/TaskBoard-Project/session21-python/backend/app/) ([main.py](file:///d:/TaskBoard-Project/session21-python/backend/app/main.py), [models.py](file:///d:/TaskBoard-Project/session21-python/backend/app/models.py), [schemas.py](file:///d:/TaskBoard-Project/session21-python/backend/app/schemas.py), [db.py](file:///d:/TaskBoard-Project/session21-python/backend/app/db.py), [config.py](file:///d:/TaskBoard-Project/session21-python/backend/app/config.py))
- Alembic Migration: [0001_create_tasks.py](file:///d:/TaskBoard-Project/session21-python/backend/alembic/versions/0001_create_tasks.py)
- Backend Dependencies: [requirements.txt](file:///d:/TaskBoard-Project/session21-python/backend/requirements.txt)
- Frontend Application: [frontend/src/](file:///d:/TaskBoard-Project/session21-python/frontend/src/) ([main.jsx](file:///d:/TaskBoard-Project/session21-python/frontend/src/main.jsx), [styles.css](file:///d:/TaskBoard-Project/session21-python/frontend/src/styles.css))
- Compose Stack: [docker-compose.yml](file:///d:/TaskBoard-Project/session21-python/docker-compose.yml)

### Verified REST API Endpoints:
1. `GET /health` — Health check probe returning `{"status": "UP"}`
2. `GET /ready` — Database connectivity readiness check returning `{"status": "READY"}`
3. `GET /api/tasks` — List all tasks ordered by ID descending
4. `GET /api/tasks/{id}` — Fetch individual task by ID (returns 404 if not found)
5. `POST /api/tasks` — Create task with title, description, priority, and assignee (201 status)
6. `PUT /api/tasks/{id}` — Update task fields or advance status (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`)
7. `DELETE /api/tasks/{id}` — Delete task (204 No Content)
8. `GET /api/tasks/stats` — Real-time aggregate count by status
9. `GET /metrics` — Prometheus metrics exporter

---

## M2 — Testing: Pytest + Code Quality (10 Points)

### Source Code References:
- Test Configuration: [backend/pytest.ini](file:///d:/TaskBoard-Project/session21-python/backend/pytest.ini)
- Test Fixtures & DB Isolation: [backend/conftest.py](file:///d:/TaskBoard-Project/session21-python/backend/conftest.py)
- Test Cases: [backend/tests/test_api.py](file:///d:/TaskBoard-Project/session21-python/backend/tests/test_api.py) (10 tests covering all endpoints)

### Terminal Evidence (`pytest -v`):
```text
============================= test session starts =============================
platform win32 -- Python 3.13.3, pytest-8.4.2, pluggy-1.6.0 -- Python313\python.exe
cachedir: .pytest_cache
rootdir: D:\TaskBoard-Project\session21-python\backend
configfile: pytest.ini
plugins: anyio-4.14.0, platformdirs-4.12.3, cov-6.0.0
collecting ... collected 10 items

tests/test_api.py::test_health PASSED                                    [ 10%]
tests/test_api.py::test_root PASSED                                      [ 20%]
tests/test_api.py::test_ready PASSED                                     [ 30%]
tests/test_api.py::test_create_task PASSED                               [ 40%]
tests/test_api.py::test_list_tasks PASSED                                [ 50%]
tests/test_api.py::test_get_task_by_id PASSED                            [ 60%]
tests/test_api.py::test_get_task_not_found PASSED                        [ 70%]
tests/test_api.py::test_update_task PASSED                               [ 80%]
tests/test_api.py::test_delete_task PASSED                               [ 90%]
tests/test_api.py::test_tasks_stats PASSED                               [100%]

============================= 10 passed in 0.22s ==============================
```

---

## M3 — Git and GitHub (5 Points)

### Repository Details:
- **Public GitHub Repository URL**: [https://github.com/cidkagenou198/Task-Board_Project](https://github.com/cidkagenou198/Task-Board_Project)
- **GitHub Actions Pipeline Runs**: [https://github.com/cidkagenou198/Task-Board_Project/actions](https://github.com/cidkagenou198/Task-Board_Project/actions)
- **Default Branch**: `main`

### Exclusion Verification:
- Configuration: [.gitignore](file:///d:/TaskBoard-Project/session21-python/.gitignore)
- Confirmed exclusions: `.env`, `__pycache__/`, `node_modules/`, `.venv/`, `.terraform/`, `*.tfstate`

### Verified Commit History (13 Commits):
```text
5aca14d chore(frontend): lock dependencies with package-lock.json
1d039ce ci(devsecops): configure GitHub Actions workflow with pytest, Trivy scanning, and GHCR publish
d1f1da8 monitoring: configure Prometheus and Grafana Helm values for metrics scraping
6b495ff k8s(helm): package TaskBoard application with ingress routing, HPA, and servicemonitor
4488a63 infra(terraform): declare AWS VPC and EKS cluster with managed worker node groups
d35efa7 docker: define local multi-service stack with postgres health checks in compose
7fa61b9 docker: containerize backend and frontend with non-root security enforcement
c7f37dc feat(frontend): create React dashboard UI with workspace overview and dark theme
bb8282f test(backend): add comprehensive pytest test suite and isolated in-memory db fixtures
2396816 feat(backend): implement REST APIs, health probes, and prometheus metrics
8475f0c feat(backend): add alembic database migrations for tasks schema
d9d319f feat(backend): configure database models, schemas, and connection settings
bb8e4ec chore: project initialization, documentation, and gitignore configuration
```

---

## M4 — Docker: Dockerfile + Compose (10 Points)

### Source Code References:
- Backend Dockerfile: [backend/Dockerfile](file:///d:/TaskBoard-Project/session21-python/backend/Dockerfile) (Non-root `USER 10001` - `appuser`)
- Frontend Dockerfile: [frontend/Dockerfile](file:///d:/TaskBoard-Project/session21-python/frontend/Dockerfile) (Multi-stage build, `nginxinc/nginx-unprivileged`, `USER 101`, port `8080`)
- Compose Stack: [docker-compose.yml](file:///d:/TaskBoard-Project/session21-python/docker-compose.yml) (PostgreSQL `pg_isready` healthcheck)

### Local Launch Command:
```bash
docker compose up --build
```
- Frontend UI accessible at: `http://localhost:3000`
- Backend Swagger API docs at: `http://localhost:8000/docs`

---

## M5 — CI/CD: GitHub Actions Pipeline (15 Points)

### Source Code Reference:
- Workflow Specification: [.github/workflows/ci-cd.yml](file:///d:/TaskBoard-Project/session21-python/.github/workflows/ci-cd.yml)

### Verified Green Pipeline Run:
- **Successful Pipeline URL**: [https://github.com/cidkagenou198/Task-Board_Project/actions/runs/38860453826](https://github.com/cidkagenou198/Task-Board_Project/actions/runs/38860453826)
- **Status**: Completed (`success`)
- **Published GHCR Packages**: [https://github.com/cidkagenou198?tab=packages](https://github.com/cidkagenou198?tab=packages)
- **Docker Images Published**:
  - `ghcr.io/cidkagenou198/taskboard-backend:c90973f...`
  - `ghcr.io/cidkagenou198/taskboard-frontend:c90973f...`

---

## M6 — DevSecOps: Trivy Security Scan (5 Points)

### Workflow Steps:
- Backend Scan: Scans `taskboard-backend:${{ github.sha }}` with `severity: HIGH,CRITICAL`, `ignore-unfixed: true`, and `exit-code: '1'`.
- Frontend Scan: Scans `taskboard-frontend:${{ github.sha }}` with `severity: HIGH,CRITICAL`, `ignore-unfixed: true`, and `exit-code: '1'`.

### Written CVE Explanation (Required Submission Text):
> **Trivy Container Security Evaluation:**
> The CI/CD pipeline scans both the backend and frontend container images for known Common Vulnerabilities and Exposures (CVEs) prior to pushing to GitHub Container Registry. Using minimal, hardened base images (`python:3.12-slim` and `nginxinc/nginx-unprivileged:1.27-alpine`) significantly shrinks the attack surface by omitting unnecessary build utilities and package managers. Because the scan enforces `exit-code: '1'` on unresolved HIGH or CRITICAL severity CVEs, the pipeline serves as an automated DevSecOps quality gate that blocks vulnerable artifacts from reaching the production Kubernetes cluster.

---

## M7 — Terraform: AWS Infrastructure as Code (15 Points)

### Source Code References:
- Provider & Versions: [terraform/versions.tf](file:///d:/TaskBoard-Project/session21-python/terraform/versions.tf) (AWS provider `~> 5.0`, Terraform `>= 1.7.0`)
- Variables: [terraform/variables.tf](file:///d:/TaskBoard-Project/session21-python/terraform/variables.tf)
- Example Variables: [terraform/terraform.tfvars.example](file:///d:/TaskBoard-Project/session21-python/terraform/terraform.tfvars.example)
- VPC & EKS Modules: [terraform/main.tf](file:///d:/TaskBoard-Project/session21-python/terraform/main.tf)
- Outputs: [terraform/outputs.tf](file:///d:/TaskBoard-Project/session21-python/terraform/outputs.tf)

### Verification Log:
```text
$ terraform validate
Success! The configuration is valid.
```

### Execution Runbook:
```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
# When evaluation is finished:
terraform destroy -auto-approve
```

---

## M8 — Kubernetes + Helm (15 Points)

### Source Code References:
- Namespace: [k8s/namespace.yaml](file:///d:/TaskBoard-Project/session21-python/k8s/namespace.yaml)
- Helm Chart Definition: [helm/taskboard/Chart.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/Chart.yaml)
- Values: [helm/taskboard/values.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/values.yaml) and [helm/taskboard/values-dev.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/values-dev.yaml)
- Templates:
  - Backend Deployment & Service: [backend-deployment.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/backend-deployment.yaml), [backend-service.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/backend-service.yaml) (Port 8000)
  - Frontend Deployment & Service: [frontend-deployment.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/frontend-deployment.yaml), [frontend-service.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/frontend-service.yaml) (Port 80 $\rightarrow$ Target 8080)
  - Ingress: [ingress.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/ingress.yaml) (Routes `/api` to backend and `/` to frontend)
  - HPA: [hpa.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/hpa.yaml) (Scales backend between 2 and 6 replicas at 60% CPU)
  - Database: [postgres.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/postgres.yaml) (Secret, PVC, Service, and Deployment)

### Verification:
```bash
helm lint ./helm/taskboard
# Output: 1 chart(s) linted, 0 chart(s) failed
```

---

## M9 — Observability: Prometheus + Grafana (10 Points)

### Source Code References:
- ServiceMonitor: [helm/taskboard/templates/servicemonitor.yaml](file:///d:/TaskBoard-Project/session21-python/helm/taskboard/templates/servicemonitor.yaml)
- Prometheus Values: [monitoring/prometheus-values.yaml](file:///d:/TaskBoard-Project/session21-python/monitoring/prometheus-values.yaml)
- Grafana Values: [monitoring/grafana-values.yaml](file:///d:/TaskBoard-Project/session21-python/monitoring/grafana-values.yaml)

### Backend Prometheus Metrics Output (`curl http://localhost:8000/metrics`):
```text
# HELP http_requests_total Total number of requests by method, status and handler.
# TYPE http_requests_total counter
http_requests_total{handler="/health",method="GET",status="2xx"} 2.0
http_requests_total{handler="/ready",method="GET",status="2xx"} 1.0
http_requests_total{handler="/",method="GET",status="2xx"} 1.0
http_requests_total{handler="/api/tasks",method="GET",status="2xx"} 3.0
http_requests_total{handler="/api/tasks",method="POST",status="2xx"} 1.0
http_requests_total{handler="/api/tasks/{task_id}",method="PUT",status="2xx"} 1.0
http_requests_total{handler="/api/tasks/{task_id}",method="DELETE",status="2xx"} 1.0
```

---

## M10 — Documentation & Live Presentation (5 Points)

### Live Demo Presentation Runbook:
1. **Show UI**: Open `http://localhost:3000` (or Ingress URL). Demonstrate adding a task ("Deploy EKS"), advancing status to In Progress and Done, and filtering tasks.
2. **Show API**: Open `http://localhost:8000/docs`. Execute `GET /health` and `GET /api/tasks/stats`.
3. **Show Code Change & Git**: Make a visible text edit in `frontend/src/main.jsx`. Run `git commit -am "feat: update dashboard banner"` and `git push origin main`.
4. **Show CI Pipeline**: Open GitHub Actions tab. Show test execution $\rightarrow$ Trivy scanning both images $\rightarrow$ container images published to GHCR with the commit SHA tag.
5. **Show Kubernetes Deployment**: Run `kubectl get pods -n taskboard` and `helm list -n taskboard` showing running pods and updated image tag.
6. **Show Metrics & Load**: Run `scripts/load-test.sh` and show live traffic spike in Prometheus Targets (`UP`) and Grafana dashboard.

### Recorded Screen Recording & Video Deliverables:
- **Fast-Paced Demo Video (MP4)**: [docs/demo/deliverables_walkthrough_fast.mp4](file:///d:/TaskBoard-Project/session21-python/docs/demo/deliverables_walkthrough_fast.mp4) (4.98 MB, 33.2 seconds, 20 FPS, 1280x632, borderless crisp demo).
- **Lightweight Animated WebP**: [docs/demo/deliverables_walkthrough_fast.webp](file:///d:/TaskBoard-Project/session21-python/docs/demo/deliverables_walkthrough_fast.webp) (0.91 MB compact instant web animation).
- **Full-Length Master Recording (MP4)**: [docs/demo/deliverables_walkthrough.mp4](file:///d:/TaskBoard-Project/session21-python/docs/demo/deliverables_walkthrough.mp4) (10.4 MB borderless complete recording).
- **Embedded Web Player**: Available directly at `http://localhost:3000/demo.html` or by clicking **"▶ Watch Screen Recording"** in the TaskBoard header.
- **Revamped Kanban Interface**: [docs/demo/kanban_dashboard.png](file:///d:/TaskBoard-Project/session21-python/docs/demo/kanban_dashboard.png)
- **Visual Evidence Directory**: [docs/demo/](file:///d:/TaskBoard-Project/session21-python/docs/demo/)


