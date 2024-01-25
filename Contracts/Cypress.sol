pragma solidity ^0.8.9;

contract Cypress {

    //should the user recieve the VET from the contract directly as oracle updates?

    address payable owner;
    address oracle;

    modifier onlyOwner {
        require (msg.sender == owner);
        _;
    }

    modifier onlyOracle {
        require (msg.sender == oracle);
        _;
    }

    constructor () payable {
        owner = payable(msg.sender);
        balance = 0;
        oracle = payable(msg.sender);
    }

    struct Plant {
        uint256 id;
        address plantOwner;
        uint256 plantType;
    }

    struct User {
        address wallet; 
        uint256[] ownedPlants;
    }

    uint256 public balance;
    uint256 public tokensPerGrowth = 10; 
    uint256 lastPlantId = 0;
    mapping (uint256 => uint256) public plantCosts;
    mapping (uint256 => Plant) public plants;
    mapping (address => User) public users;
    mapping (address => uint256) public usersToMilesBiked;
    mapping (address => uint256) public usersToRideShares;
    mapping (address => uint256) public usersToBalance; //tracks user balance and spendable VET
    mapping (uint256 => uint256) public plantIdToGrowth;

    function setPlantCost(uint256 plantType, uint256 plantCost) public onlyOwner {
        plantCosts[plantType] = plantCost; 
    }

    function setTokensPerGrowth(uint256 _newRate) public onlyOwner { 
        tokensPerGrowth = _newRate;
    }

    //setter and getter for user and plant 

    function createUser() external {
        require (users[msg.sender].wallet == address(0), "User already exists!");
        users[msg.sender] = User({
            wallet: msg.sender,
            ownedPlants: new uint256[](0)
        });
    }

    function updateRidesShared(uint256 _newRidesShared, address _user) external onlyOracle { //only way to add 
        require (_newRidesShared > 0, "New ride shares value must be higher than 0");
        uint256 payout = _newRidesShared * 5;
        require(balance >= payout, "Insufficient balance for payout");
        balance -= payout;
        payable(_user).transfer(payout);
        usersToRideShares[_user] += _newRidesShared;
        usersToBalance[_user] += (payout);
    }

    function updateMilesBiked(uint256 _newMilesBiked, address _user) external onlyOracle { //only oracle can update and add rewards
        require (_newMilesBiked > 0, "New miles value must be higher than 0");
        uint256 payout = _newMilesBiked;
        require(balance >= payout, "Insufficient balance for payout");
        balance -= payout;
        payable(_user).transfer(payout);
        usersToMilesBiked[_user] += _newMilesBiked;
        usersToBalance[_user] += (payout);
    }

    function newPlant(uint256 plantType) payable external {
        require(msg.value >= plantCosts[plantType], "Insufficient funds");
        require(msg.value >= usersToBalance[msg.sender], "Insufficient spendable VET");

        usersToBalance[msg.sender] -= msg.value; //update new balance

        plants[lastPlantId] = Plant({
            id: lastPlantId,
            plantOwner: msg.sender,
            plantType: plantType
        });

        plantIdToGrowth[lastPlantId] = 0;
        users[msg.sender].ownedPlants.push(lastPlantId);

        lastPlantId++;
    }

    function growPlant(uint256 plantId) payable external {
        require (plants[plantId].id != 0, "Plant does not exist");
        require (msg.sender == plants[plantId].plantOwner, "Only the owner can grow their plant");
        require(msg.value >= usersToBalance[msg.sender], "Insufficient spendable VET");
        require(msg.value > 0, "Only positive growth values allowed");

        usersToBalance[msg.sender] -= msg.value; //update new balance

        plantIdToGrowth[plantId] += msg.value;
    }

    
    function getOwnedPlants() external view returns (uint256[] memory) {
        require(users[msg.sender].wallet != address(0), "User does not exist");
        return users[msg.sender].ownedPlants;
    }

    // ...

    function getPlantDetails(uint256 plantId) external view returns (uint256, address, uint256) {
require(users[msg.sender].wallet != address(0), "User does not exist");
        require(plantId < lastPlantId, "Plant ID does not exist");
        require(plants[plantId].plantOwner == msg.sender, "User does not own the plant");
        Plant memory plant = plants[plantId];
    return (plant.id, plant.plantOwner, plant.plantType);
}
    // Function for any user to contribute towards the balance
    function contribute(uint256 _amount) public {
        require(_amount > 0, "Contribution amount must be higher than 0");    
        balance += _amount;
    }
}
