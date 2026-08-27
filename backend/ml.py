import torch
import torch.nn as nn
import os

MODEL_PATH = "backend/surrogate_model.pt"

class SurrogateModel(nn.Module):
    def __init__(self):
        super().__init__()
        # Input: [breach_width, reservoir_capacity, time]
        # Output: [peak_discharge]
        self.net = nn.Sequential(
            nn.Linear(3, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, 1)
        )
        
    def forward(self, x):
        return self.net(x)

def train_dummy_model():
    """Trains the surrogate model on a synthetic mathematical dataset."""
    if os.path.exists(MODEL_PATH):
        return
        
    print("Training PyTorch Surrogate Model...")
    model = SurrogateModel()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.MSELoss()
    
    # Generate synthetic data
    # y = (w / 50) * (c / 100) * 10000 * exp(-t*0.5) roughly
    X = []
    Y = []
    for _ in range(1000):
        w = torch.rand(1).item() * 190 + 10 # 10 to 200
        c = torch.rand(1).item() * 50 + 50 # 50 to 100
        t = torch.rand(1).item() * 12 # 0 to 12
        
        peak = (w / 50.0) * (c / 100.0) * 10000.0
        if t > 1: # assuming Tf = 1 for simplicity in this dummy data
             q = peak * torch.exp(torch.tensor(-(t - 1) * 0.5)).item()
        else:
             q = peak * t
             
        X.append([w, c, t])
        Y.append([q])
        
    X = torch.tensor(X, dtype=torch.float32)
    Y = torch.tensor(Y, dtype=torch.float32)
    
    # Train
    for epoch in range(500):
        optimizer.zero_grad()
        out = model(X)
        loss = criterion(out, Y)
        loss.backward()
        optimizer.step()
        
    torch.save(model.state_dict(), MODEL_PATH)
    print("Model saved to", MODEL_PATH)

# Global model instance for fast inference
_model = None

def get_surrogate_prediction(breach_width, capacity, time):
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            train_dummy_model()
        _model = SurrogateModel()
        _model.load_state_dict(torch.load(MODEL_PATH, weights_only=True))
        _model.eval()
        
    # Inference
    with torch.no_grad():
        x = torch.tensor([[float(breach_width), float(capacity), float(time)]], dtype=torch.float32)
        prediction = _model(x)
        return prediction[0][0].item()

if __name__ == "__main__":
    train_dummy_model()
