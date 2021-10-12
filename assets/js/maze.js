var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
function move(maze, dir) {
    if (maze.player.properties["movementDisabled"]) {
        return maze;
    }
    var pos = {
        x: maze.player.loc.x.valueOf(),
        y: maze.player.loc.y.valueOf()
    };
    switch (dir) {
        case Direction.Up:
            pos.y -= 1;
            break;
        case Direction.Down:
            pos.y += 1;
            break;
        case Direction.Left:
            pos.x -= 1;
            break;
        case Direction.Right:
            pos.x += 1;
            break;
    }
    if (pos.x >= 0 && pos.x < maze.xdim &&
        pos.y >= 0 && pos.y < maze.ydim &&
        maze.maze[pos.y][pos.x]) {
        maze.player.loc.x = pos.x.valueOf();
        maze.player.loc.y = pos.y.valueOf();
    }
    return maze;
}
function handleCallbacks(maze) {
    for (var _i = 0, _a = maze.props; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (maze.player.loc.x == prop.loc.x && maze.player.loc.y == prop.loc.y) {
            prop.callback(prop, maze.player);
        }
    }
}
function renderGrid(grid) {
    var wallBlock = "🌲";
    var pathBlock = "⬜️";
    var outarr = grid.map(function (row) {
        return row.map(function (elem) {
            return elem ? pathBlock : wallBlock;
        });
    });
    return outarr;
}
function concatStrings(arr) {
    var outstr = arr.map(function (element) {
        return element.join("");
    }).join("<br />");
    return outstr;
}
function renderMaze(maze, renderChars) {
    var outarr = renderGrid(maze.maze);
    function set_special_elem(arr, coord, char) {
        arr[coord.y][coord.x] = char;
    }
    for (var _i = 0, _a = maze.props; _i < _a.length; _i++) {
        var prop = _a[_i];
        if (prop.visible) {
            set_special_elem(outarr, prop.loc, prop.representation);
        }
    }
    set_special_elem(outarr, maze.player.loc, maze.player.representation);
    return concatStrings(outarr);
}
function find_valid_pos(grid, min, max, proplist) {
    var xrange = max.x - min.x;
    var yrange = max.y - min.y;
    var maxiters = 32;
    for (var i = 0; i < maxiters; i++) {
        var x = Math.floor(Math.random() * xrange + 1 + min.x);
        var y = Math.floor(Math.random() * yrange + 1 + min.y);
        // If the chosen pos is a wall block, try a new one
        if (!grid[y][x]) {
            continue;
        }
        // If the chosen pos already has a prop, try a new one
        var validpos = true;
        for (var _i = 0, proplist_1 = proplist; _i < proplist_1.length; _i++) {
            var prop = proplist_1[_i];
            if (prop.loc.x == x && prop.loc.y == y) {
                validpos = false;
            }
        }
        if (validpos) {
            return { x: x, y: y };
        }
    }
    return { x: 0, y: 0 };
}
function init() {
    disableScroll();
    var e = document.getElementById("size");
    var size = parseInt(e.selectedOptions[0].value);
    var mazeDOM = document.getElementById("maze");
    var htmlsize = 2 * size + 1;
    console.log("Size is ", size);
    var grid = generate_maze(size, size);
    console.log(grid);
    var player = {
        loc: { x: 1, y: 1 },
        properties: {},
        representation: "👦🏼"
    };
    var props = [];
    props.push({
        loc: find_valid_pos(grid, { x: htmlsize / 2, y: 0 }, { x: htmlsize - 1, y: htmlsize / 2 }, props),
        visible: true,
        callback: function (obj, player) {
            if (obj.visible) {
                player.properties['hasKey'] = true;
                obj.visible = false;
                setMessage("You pick up the cheese!");
            }
        },
        representation: "🧀"
    });
    props.push({
        loc: find_valid_pos(grid, { x: 0, y: 0 }, { x: 6, y: 6 }, props),
        visible: true,
        callback: function (obj, player) {
            if (obj.visible) {
                player.properties['hasSpray'] = true;
                obj.visible = false;
                setMessage("You pick up the bearspray!");
            }
        },
        representation: "🍼"
    });
    props.push({
        loc: find_valid_pos(grid, { x: htmlsize / 2, y: 0 }, { x: htmlsize - 1, y: htmlsize / 2 }, props),
        visible: true,
        callback: function (obj, player) {
            setMessage("You find a moose bone in the woods. It makes you ask yourself—DO YOU DESERVE YOUR BONES?");
        },
        representation: "🦴"
    });
    for (var i = 0; i < size; i++) {
        props.push({
            loc: find_valid_pos(grid, { x: 6, y: 6 }, { x: htmlsize - 2, y: htmlsize - 2 }, props),
            visible: true,
            callback: function (obj, player) {
                if (obj.visible) {
                    if (player.properties['hasSpray']) {
                        setMessage("You spray the bear and it retreats into the forest!");
                        obj.visible = false;
                    }
                    else {
                        setMessage("You bump into the bear without bearspray handy. Whoops!");
                        player.properties["movementDisabled"] = true;
                    }
                }
            },
            representation: "🐻"
        });
    }
    props.push({
        loc: find_valid_pos(grid, { x: 6, y: 6 }, { x: htmlsize - 2, y: htmlsize - 2 }, props),
        visible: false,
        callback: function (obj, player) {
            obj.visible = true;
            setMessage("The scuttling horror jumps out of the trees. \"Come here, my precious\" it screeches.");
        },
        representation: "🧝‍♂️"
    });
    props.push({
        loc: { x: htmlsize - 2, y: htmlsize - 2 },
        visible: true,
        callback: function (obj, player) {
            if (player.properties['hasKey']) {
                setMessage("Nancy: \"Hooray! You brought me cheese!\"");
            }
            else {
                setMessage("Nancy: \"Blegh! Bring me cheese!\"");
            }
        },
        representation: "👩🏼"
    });
    var maze = {
        maze: grid,
        player: player,
        props: props,
        xdim: 2 * size + 1,
        ydim: 2 * size + 1
    };
    mazeDOM.innerHTML = renderMaze(maze, true);
    function update(event) {
        var update = false;
        var dir;
        switch (event.key) {
            case "ArrowLeft":
                update = true;
                dir = Direction.Left;
                break;
            case "ArrowRight":
                update = true;
                dir = Direction.Right;
                break;
            case "ArrowUp":
                update = true;
                dir = Direction.Up;
                break;
            case "ArrowDown":
                update = true;
                dir = Direction.Down;
                break;
        }
        if (update) {
            setMessage("");
            maze = move(maze, dir);
            handleCallbacks(maze);
            mazeDOM.innerHTML = renderMaze(maze, true);
        }
    }
    document.addEventListener('keydown', update);
}
var CellDir;
(function (CellDir) {
    CellDir[CellDir["North"] = 1] = "North";
    CellDir[CellDir["South"] = 2] = "South";
    CellDir[CellDir["East"] = 4] = "East";
    CellDir[CellDir["West"] = 8] = "West";
})(CellDir || (CellDir = {}));
;
var MazeMode;
(function (MazeMode) {
    MazeMode[MazeMode["Combo"] = 0] = "Combo";
    MazeMode[MazeMode["Newest"] = 1] = "Newest";
    MazeMode[MazeMode["Midpoint"] = 2] = "Midpoint";
    MazeMode[MazeMode["Random"] = 3] = "Random";
})(MazeMode || (MazeMode = {}));
function choose_index(cells, mode) {
    switch (mode) {
        case MazeMode.Combo:
            if (Math.random() > 0.25) {
                return choose_index(cells, MazeMode.Newest);
            }
            else {
                return choose_index(cells, MazeMode.Random);
            }
            break;
        case MazeMode.Newest:
            return cells.length - 1;
            break;
        case MazeMode.Midpoint:
            return Math.floor(cells.length * 0.75);
            break;
        case MazeMode.Random:
            return random_int(0, cells.length);
            break;
        default:
            return 0;
    }
}
function generate_maze(width, height) {
    var e = document.getElementById("genalgo");
    var genstr = e.selectedOptions[0].value;
    var mode;
    switch (genstr) {
        case "combo":
            mode = MazeMode.Combo;
            break;
        case "new":
            mode = MazeMode.Newest;
            break;
        case "mid":
            mode = MazeMode.Midpoint;
            break;
        case "rand":
            mode = MazeMode.Random;
            break;
    }
    var grid;
    grid = [];
    for (var y_1 = 0; y_1 < height; y_1++) {
        grid[y_1] = [];
        for (var x_1 = 0; x_1 < width; x_1++) {
            grid[y_1][x_1] = 0;
        }
    }
    var x = random_int(0, width);
    var y = random_int(0, height);
    var cells = [];
    cells.push({ x: x, y: y });
    while (cells.length > 0) {
        var idx = choose_index(cells, mode);
        var cx = cells[idx].x;
        var cy = cells[idx].y;
        var dirs = [CellDir.North, CellDir.South, CellDir.East, CellDir.West];
        shuffleArray(dirs);
        var deadend = true;
        for (var _i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
            var dir = dirs_1[_i];
            var nx = cx + dx(dir);
            var ny = cy + dy(dir);
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] == 0) {
                grid[cy][cx] |= dir;
                grid[ny][nx] |= opposite(dir);
                cells.push({ x: nx, y: ny });
                deadend = false;
                break;
            }
        }
        if (deadend) {
            console.log("Removing a cell");
            cells.splice(idx, 1);
        }
    }
    return mazeGridtoBlockGrid(grid);
}
function mazeGridtoBlockGrid(mazegrid) {
    var height = mazegrid.length;
    var width = mazegrid[0].length;
    var outgrid;
    outgrid = [];
    // Create an outgrid of pure walls
    for (var y = 0; y < 2 * height + 1; y++) {
        outgrid[y] = [];
        for (var x = 0; x < 2 * width + 1; x++) {
            outgrid[y][x] = false;
        }
    }
    //Then go through and set as appropriate:
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            outgrid[2 * y + 1][2 * x + 1] = true;
            if (mazegrid[y][x] & CellDir.South) {
                outgrid[2 * y + 2][2 * x + 1] = true;
            }
            if (mazegrid[y][x] & CellDir.East) {
                outgrid[2 * y + 1][2 * x + 2] = true;
            }
        }
    }
    return outgrid;
}
function dx(d) {
    switch (d) {
        case CellDir.East:
            return 1;
            break;
        case CellDir.West:
            return -1;
            break;
        default:
            return 0;
    }
}
function dy(d) {
    switch (d) {
        case CellDir.North:
            return -1;
            break;
        case CellDir.South:
            return 1;
            break;
        default:
            return 0;
    }
}
function opposite(d) {
    switch (d) {
        case CellDir.North:
            return CellDir.South;
            break;
        case CellDir.South:
            return CellDir.North;
            break;
        case CellDir.East:
            return CellDir.West;
            break;
        case CellDir.West:
            return CellDir.East;
            break;
    }
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function reset() {
    document.getElementById("settings").hidden = false;
    document.getElementById("mazeblock").hidden = true;
}
function disableScroll() {
    window.addEventListener("keydown", function (e) {
        // space and arrow keys
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);
}
function setMessage(msg) {
    document.getElementById("message").innerText = msg;
}
function random_int(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}
